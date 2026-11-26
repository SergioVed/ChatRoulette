import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
} from "@nestjs/websockets";
import {ChatService} from "./chat.service";
import {ErrorCode, EventType, EventType as Event, PairedUsersResponse} from "./types";
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
import {Message} from "./messages/message";

@WebSocketGateway(4321)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

    constructor(
        private userMatchingService: ChatService,
        private authService: AuthService
    ) {}

    handleDisconnect(client: WebSocket, reason?: string) {
        const partner = this.userMatchingService.findPairedClient(client)

        if (partner) {
            partner.send(JSON.stringify(new EndCallMessage(true)))
        }

        this.userMatchingService.removePair(client)
        this.userMatchingService.cancelSearch(client)
        this.userMatchingService.removeFromAuthenticatedSocketUsers(client)
    }

    handleConnection(client: WebSocket, ...args: any[]) {
        client.send(JSON.stringify(new ConnectionMessage(EventType.CONNECTED, "client connected")))
        this.setupHeartBeat(client)
    }

    private setupHeartBeat (client: WebSocket) {
        let isAlive = true;

        client.on('pong', () => {
            isAlive = true;
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

            this.userMatchingService.addClientToAuthenticatedSocketUsers(
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

        this.userMatchingService.cancelSearch(client);
        this.endCall(client, data.initiator);

        if (data.cancelSearch && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(new EndCallMessage(true, true)));
        }
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

        const message = new IceCandidateMessage(data.candidate)
        this.sendToPartner(message, client)
    }

    @SubscribeMessage(Event.ANSWER)
    handleAnswer(@ConnectedSocket() client: WebSocket, @MessageBody() data: any){
        if (!this.requireAuthenticated(client)) return

        const message = new OfferAnswerMessage(EventType.ANSWER, data.description)
        this.sendToPartner(message, client)
    }

    @SubscribeMessage(Event.OFFER)
    handleOffer(@ConnectedSocket() client: WebSocket, @MessageBody() data: any){
        if (!this.requireAuthenticated(client)) return

        const message = new OfferAnswerMessage(EventType.OFFER, data.description)
        this.sendToPartner(message, client)
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
            const match = await this.userMatchingService.findPartnerOrQueueClient(client, data.skillId, authenticatedUser.userId)
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

    private notifyUsers (match: PairedUsersResponse) {
        const receiverUser = match.receiver
        const initiatorUser = match.initiator
        const skillName = match.skillName

        initiatorUser.socket.send(JSON.stringify(new MatchedMessage(true, receiverUser.name, skillName, match.callId)));
        receiverUser.socket.send(JSON.stringify(new MatchedMessage(false, initiatorUser.name, skillName, match.callId)));
    }

    private sendToPartner (message: Message<any>, client: WebSocket) {
        const pairedClient = this.userMatchingService.findPairedClient(client)

        if (pairedClient?.readyState !== WebSocket.OPEN) {
            return;
        }

        if (pairedClient) {
            pairedClient.send(JSON.stringify(message));
        }
    }

    private requireAuthenticated (client: WebSocket) {
        try {
            return this.userMatchingService.getClientFromAuthenticatedSocketUsers(client);
        } catch (error) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(new ErrorMessage(ErrorCode.AUTH_REQUIRED)));
                client.close(1008, 'Authentication required');
            }
        }
    }
}