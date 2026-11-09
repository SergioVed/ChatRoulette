import {
    ConnectedSocket, MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
} from "@nestjs/websockets";
import {UserMatchingService} from "./user-matching.service";

@WebSocketGateway(4321)
export class UserMatchingGateway implements OnGatewayConnection, OnGatewayDisconnect {


    constructor(
        private userMatchingService: UserMatchingService
    ) {}

    private notifyUsers (match: {initiator: WebSocket, receiver: WebSocket}) {
        match.initiator.send(JSON.stringify({
            event: 'matched',
            data: {initiator: true}
        }))

        match.receiver.send(JSON.stringify({
            event: 'matched',
            data: {initiator: false}
        }))
    }

    handleDisconnect(client: WebSocket, reason?: string) {
        client.send(JSON.stringify({
            event: 'disconnected',
            data: {message: 'User disconnected'}
        }))
    }

    handleConnection(client: WebSocket, ...args: any[]) {
        client.send(JSON.stringify({
            event: 'connected',
            data: {message: 'User connected'}
        }))
    }

    @SubscribeMessage('ice-candidate')
    handleIceCandidate(@ConnectedSocket() client: WebSocket, @MessageBody() data: any) {
        const pairedClient = this.userMatchingService.findPairedClient(client)
        if (pairedClient && pairedClient.readyState === WebSocket.OPEN) {
            pairedClient.send(JSON.stringify({
                event: 'ice-candidate',
                data: {
                    candidate: data.candidate
                }
            }))
        }
    }

    @SubscribeMessage('answer')
    handleAnswer(@ConnectedSocket() client: WebSocket, @MessageBody() data: any) {
        const pairedClient = this.userMatchingService.findPairedClient(client)
        if (pairedClient) {
            pairedClient.send(JSON.stringify({
                event: 'answer',
                data: {
                    description: data.description
                }
            }))
        }
    }

    @SubscribeMessage('offer')
    handleOffer(@ConnectedSocket() client: WebSocket, @MessageBody() data: any) {
        const pairedClient = this.userMatchingService.findPairedClient(client)
        if (pairedClient) {

            pairedClient.send(JSON.stringify({
                event: 'offer',
                data: {
                    description: data.description
                }
            }))
        }
    }

    @SubscribeMessage('find-partner')
    handleFindPartner(@ConnectedSocket() client: WebSocket, @MessageBody() data: any) {
        const match = this.userMatchingService.addClientToQueue(client)

        if (match) {
            this.notifyUsers(match)
        }
    }
}