import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
} from "@nestjs/websockets";
import {UserMatchingService} from "./user-matching.service";
import {EventType, EventType as Event} from "./types";
import {MatchedMessage} from "./messages/MaatchedMessage";
import {ConnectionMessage} from "./messages/ConnectionMessage";
import { IceCandidateMessage } from './messages/IceCandidateMessage';
import { OfferAnswerMessage } from './messages/OfferAnswerMessage';
import {EndCallMessage} from "./messages/EndCallMessage";
import {AuthService} from "../auth/auth.service";

@WebSocketGateway(4321)
export class UserMatchingGateway implements OnGatewayConnection, OnGatewayDisconnect {

    constructor(
        private userMatchingService: UserMatchingService,
        private authService: AuthService
    ) {}

    private notifyUsers (match: {initiator: WebSocket, receiver: WebSocket}) {
        match.initiator.send(JSON.stringify(new MatchedMessage(true)));
        match.receiver.send(JSON.stringify(new MatchedMessage(false)));
    }

    handleDisconnect(client: WebSocket, reason?: string) {
        client.send(JSON.stringify(new ConnectionMessage(EventType.DISCONNECTED, "client disconnected")))
    }

    handleConnection(client: WebSocket, ...args: any[]) {
        client.send(JSON.stringify(new ConnectionMessage(EventType.CONNECTED, "client connected")))
    }

    @SubscribeMessage(Event.AUTHENTICATE)
    async handleAuthenticate (@ConnectedSocket() client: WebSocket, @MessageBody() data: any) {
        if (data.accessToken == '' || data.accessToken == null) {
            return;
        }

        const userId = await this.authService.verifyToken(data.accessToken);

        if (client.readyState === WebSocket.OPEN) {
            this.userMatchingService.addClientToSocketUsers(client, userId);
        }
    }

    @SubscribeMessage(Event.END_CALL)
    handleEndCall(@ConnectedSocket() client: WebSocket, @MessageBody() data: any) {
        const partner = this.userMatchingService.findPairedClient(client)

        if (partner) {
            partner.send(JSON.stringify(new EndCallMessage(data.initiator)))
        }

        this.userMatchingService.removePair(client)
    }

    @SubscribeMessage(Event.ICE_CANDIDATE)
    handleIceCandidate(@ConnectedSocket() client: WebSocket, @MessageBody() data: any) {
        const pairedClient = this.userMatchingService.findPairedClient(client)
        if (pairedClient && pairedClient.readyState === WebSocket.OPEN) {
            pairedClient.send(JSON.stringify(new IceCandidateMessage(data.candidate)));
        }
    }

    @SubscribeMessage(Event.ANSWER)
    handleAnswer(@ConnectedSocket() client: WebSocket, @MessageBody() data: any){
        this.handleOfferAnswerEvent(Event.ANSWER, client, data)
    }

    @SubscribeMessage(Event.OFFER)
    handleOffer(@ConnectedSocket() client: WebSocket, @MessageBody() data: any){
        this.handleOfferAnswerEvent(Event.OFFER, client, data)
    }

    @SubscribeMessage(Event.FIND_PARTNER)
    async handleFindPartner(@ConnectedSocket() client: WebSocket, @MessageBody() data: any) {
        console.log("received req")
        const userId = this.userMatchingService.getClientFromSocketUsers(client)
        if (!userId) {
            return;
        }


        const match = await this.userMatchingService.addClientToQueue(client, data.skillId, userId)

        if (match) {
            console.log("Matched")
            this.notifyUsers(match)
        }
    }


    private handleOfferAnswerEvent (event: Event.OFFER | Event.ANSWER, @ConnectedSocket() client: WebSocket, @MessageBody() data: any) {
        const pairedClient = this.userMatchingService.findPairedClient(client)
        if (pairedClient) {
            pairedClient.send(JSON.stringify(new OfferAnswerMessage(event, data.description)));
        }
    }
}
