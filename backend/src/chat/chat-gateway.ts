import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
} from "@nestjs/websockets";
import {ChatService} from "./chat.service";
import {ErrorCode, EventType, EventType as Event} from "./types";
import {MatchedMessage} from "./messages/MaatchedMessage";
import {ConnectionMessage} from "./messages/ConnectionMessage";
import {IceCandidateMessage} from './messages/IceCandidateMessage';
import {OfferAnswerMessage} from './messages/OfferAnswerMessage';
import {EndCallMessage} from "./messages/EndCallMessage";
import {AuthService} from "../auth/auth.service";
import WebSocket from 'ws';
import {ErrorMessage} from "./messages/ErrorMessage";
import {AuthenticatedMessage} from "./messages/AuthenticatedMessage";
import {BadRequestException, UnauthorizedException} from "@nestjs/common";

@WebSocketGateway(4321)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

    private ignoreClients:Set<WebSocket> = new Set()

    constructor(
        private userMatchingService: ChatService,
        private authService: AuthService
    ) {}

    private notifyUsers (match: {initiator: WebSocket, receiver: WebSocket}) {
        match.initiator.send(JSON.stringify(new MatchedMessage(true)));
        match.receiver.send(JSON.stringify(new MatchedMessage(false)));
    }

    handleDisconnect(client: WebSocket, reason?: string) {
        const partner = this.userMatchingService.findPairedClient(client)

        if (partner) {
            partner.send(JSON.stringify(new EndCallMessage(true)))
        }

        this.userMatchingService.removePair(client)
        this.userMatchingService.removeFromQueue(client)
        this.userMatchingService.removeFromSocketUsers(client)
    }

    handleConnection(client: WebSocket, ...args: any[]) {
        client.send(JSON.stringify(new ConnectionMessage(EventType.CONNECTED, "client connected")))
        this.setupHeartBeat(client)
    }

    private setupHeartBeat (client: WebSocket) {
        let isAlive = true;

        client.on('pong', () => {
            if (this.ignoreClients.has(client)) {
                return
            }

            isAlive = true;
            // console.log('pong')
        })

        const timeout = setInterval(() => {
            if (client.readyState === WebSocket.OPEN) {
                if (!isAlive) {
                    client.terminate();
                    return;
                }

                isAlive = false;
                client.ping();
            }
        }, 5000)

        client.on('close', () => clearInterval(timeout));
    }
    //
    // @SubscribeMessage("test_disc")
    // async handleTest (@ConnectedSocket() client: WebSocket) {
    //     this.ignoreClients.add(client)
    // }

    @SubscribeMessage(Event.AUTHENTICATE)
    async handleAuthenticate (@ConnectedSocket() client: WebSocket, @MessageBody() data: any) {
        if (data.accessToken == '' || data.accessToken == null) {
            client.send(JSON.stringify(new ErrorMessage(ErrorCode.AUTH_REQUIRED)))
            client.close(1008, 'Authenticated user is required')
            return
        }

        try {
            const authenticatedUser = await this.authService.verifyToken(data.accessToken);

            if (client.readyState !== WebSocket.OPEN) {
                return
            }

            this.userMatchingService.addClientToSocketUsers(
                client,
                authenticatedUser
            );

            client.send(JSON.stringify(new AuthenticatedMessage()))
        } catch (error) {
            client.send(JSON.stringify(new ErrorMessage(ErrorCode.AUTH_REQUIRED)))
        }
    }

    @SubscribeMessage(Event.END_CALL)
    handleEndCall(client: WebSocket, data: any) {
        if (!this.requireAuthenticated(client)) return;

        this.endCall(client, data.initiator);
    }

    private endCall(client: WebSocket, initiator: boolean) {
        const partner = this.userMatchingService.findPairedClient(client);

        this.userMatchingService.removePair(client);

        if (partner?.readyState === WebSocket.OPEN) {
            partner.send(JSON.stringify(new EndCallMessage(initiator)));
        }
    }

    @SubscribeMessage(Event.NEXT)
    async handleNext(@ConnectedSocket() client: WebSocket, @MessageBody() data: any) {
        if (!this.requireAuthenticated(client)) return;

        this.endCall(client, true);

        await this.handleFindPartner(client, {
            skillId: data.skillId
        })
    }

    @SubscribeMessage(Event.ICE_CANDIDATE)
    handleIceCandidate(@ConnectedSocket() client: WebSocket, @MessageBody() data: any) {
        if (!this.requireAuthenticated(client)) return

        const pairedClient = this.userMatchingService.findPairedClient(client)

        if (pairedClient?.readyState !== WebSocket.OPEN) return

        if (pairedClient) {
            pairedClient.send(JSON.stringify(new IceCandidateMessage(data.candidate)));
        }
    }

    @SubscribeMessage(Event.ANSWER)
    handleAnswer(@ConnectedSocket() client: WebSocket, @MessageBody() data: any){
        if (!this.requireAuthenticated(client)) return

        this.handleOfferAnswerEvent(Event.ANSWER, client, data)
    }

    @SubscribeMessage(Event.OFFER)
    handleOffer(@ConnectedSocket() client: WebSocket, @MessageBody() data: any){
        if (!this.requireAuthenticated(client)) return

        this.handleOfferAnswerEvent(Event.OFFER, client, data)
    }

    @SubscribeMessage(Event.FIND_PARTNER)
    async handleFindPartner(@ConnectedSocket() client: WebSocket, @MessageBody() data: any) {
        const authenticatedUser = this.requireAuthenticated(client);
        if (!authenticatedUser) return

        const pairedClient = this.userMatchingService.findPairedClient(client)
        if (pairedClient && pairedClient.readyState === WebSocket.OPEN) {
            pairedClient.send(JSON.stringify(new EndCallMessage(true)))
        }
        this.userMatchingService.removePair(client)

        try {
            const match = await this.userMatchingService.addClientToQueue(client, data.skillId, authenticatedUser.userId)
            if (match) {
                this.notifyUsers(match)
            }
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                client.send(JSON.stringify(new ErrorMessage(ErrorCode.AUTH_REQUIRED)))
            } else if (error instanceof BadRequestException) {
                client.send(JSON.stringify(new ErrorMessage(ErrorCode.SKILL_NOT_ASSIGNED)))
            } else {
                client.send(JSON.stringify(new ErrorMessage(ErrorCode.INTERNAL_ERROR)))
            }
        }
    }

    private handleOfferAnswerEvent (event: Event.OFFER | Event.ANSWER, @ConnectedSocket() client: WebSocket, @MessageBody() data: any) {
        const pairedClient = this.userMatchingService.findPairedClient(client)
        if (pairedClient) {
            pairedClient.send(JSON.stringify(new OfferAnswerMessage(event, data.description)));
        }
    }

    private requireAuthenticated (client: WebSocket) {
        try {
            return this.userMatchingService.getClientFromSocketUsers(client);
        } catch (error) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(new ErrorMessage(ErrorCode.AUTH_REQUIRED)));
                client.close(1008, 'Authentication required');
            }
        }
    }
}