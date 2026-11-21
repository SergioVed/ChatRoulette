import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
} from "@nestjs/websockets";
import {ChatService} from "./chat.service";
import {EventType, EventType as Event} from "./types";
import {MatchedMessage} from "./messages/MaatchedMessage";
import {ConnectionMessage} from "./messages/ConnectionMessage";
import { IceCandidateMessage } from './messages/IceCandidateMessage';
import { OfferAnswerMessage } from './messages/OfferAnswerMessage';
import {EndCallMessage} from "./messages/EndCallMessage";
import {AuthService} from "../auth/auth.service";

@WebSocketGateway(4321)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

    constructor(
        private userMatchingService: ChatService,
        private authService: AuthService
    ) {}

    private notifyUsers (match: {initiator: WebSocket, receiver: WebSocket}) {
        match.initiator.send(JSON.stringify(new MatchedMessage(true)));
        match.receiver.send(JSON.stringify(new MatchedMessage(false)));
    }

    handleDisconnect(client: WebSocket, reason?: string) {
        client.send(JSON.stringify(new ConnectionMessage(EventType.DISCONNECTED, "client disconnected")))

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
    }

    @SubscribeMessage(Event.AUTHENTICATE)
    async handleAuthenticate (@ConnectedSocket() client: WebSocket, @MessageBody() data: any) {
        if (data.accessToken == '' || data.accessToken == null) {
            return;
        }

        const authenticatedUser = await this.authService.verifyToken(data.accessToken);

        if (client.readyState === WebSocket.OPEN) {
            this.userMatchingService.addClientToSocketUsers(client, authenticatedUser);
        }
    }

    @SubscribeMessage(Event.END_CALL)
    handleEndCall(@ConnectedSocket() client: WebSocket, @MessageBody() data: any) {
        if (!this.ensureAuthenticated(client)) {
            return
        }

        const partner = this.userMatchingService.findPairedClient(client)
        this.userMatchingService.removePair(client)

        if (partner) {
            partner.send(JSON.stringify(new EndCallMessage(data.initiator)))
        }
    }

    @SubscribeMessage(Event.NEXT)
    async handleNext(@ConnectedSocket() client: WebSocket, @MessageBody() data: any) {
        this.handleEndCall(client, {
            initiator: true
        })

        await this.handleFindPartner(client, {
            skillId: data.skillId
        })
    }

    @SubscribeMessage(Event.ICE_CANDIDATE)
    handleIceCandidate(@ConnectedSocket() client: WebSocket, @MessageBody() data: any) {
        if (!this.ensureAuthenticated(client)) {
            return
        }

        const pairedClient = this.userMatchingService.findPairedClient(client)
        if (pairedClient && pairedClient.readyState === WebSocket.OPEN) {
            pairedClient.send(JSON.stringify(new IceCandidateMessage(data.candidate)));
        }
    }

    @SubscribeMessage(Event.ANSWER)
    handleAnswer(@ConnectedSocket() client: WebSocket, @MessageBody() data: any){
        if (!this.ensureAuthenticated(client)) {
            return
        }
        this.handleOfferAnswerEvent(Event.ANSWER, client, data)
    }

    @SubscribeMessage(Event.OFFER)
    handleOffer(@ConnectedSocket() client: WebSocket, @MessageBody() data: any){
        if (!this.ensureAuthenticated(client)) {
            return
        }
        this.handleOfferAnswerEvent(Event.OFFER, client, data)
    }

    @SubscribeMessage(Event.FIND_PARTNER)
    async handleFindPartner(@ConnectedSocket() client: WebSocket, @MessageBody() data: any) {
        if (!this.ensureAuthenticated(client)) {
            return
        }

        const authenticatedUser = this.userMatchingService.getClientFromSocketUsers(client)
        if (!authenticatedUser?.userId) {
            return;
        }

        const pairedClient = this.userMatchingService.findPairedClient(client)
        if (pairedClient && pairedClient.readyState === WebSocket.OPEN) {
            pairedClient.send(JSON.stringify(new EndCallMessage(true)))
        }
        this.userMatchingService.removePair(client)

        const match = await this.userMatchingService.addClientToQueue(client, data.skillId, authenticatedUser?.userId)
        if (match) {
            this.notifyUsers(match)
        }
    }


    private handleOfferAnswerEvent (event: Event.OFFER | Event.ANSWER, @ConnectedSocket() client: WebSocket, @MessageBody() data: any) {
        const pairedClient = this.userMatchingService.findPairedClient(client)
        if (pairedClient) {
            pairedClient.send(JSON.stringify(new OfferAnswerMessage(event, data.description)));
        }
    }

    private ensureAuthenticated (client: WebSocket) {
        if (!this.userMatchingService.checkAuthenticatedSocket(client)) {
            client.close(1008, 'Unauthorized')
            return false;
        }
        return true;
    }

}
