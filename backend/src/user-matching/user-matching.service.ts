import { Injectable } from '@nestjs/common';

@Injectable()
export class UserMatchingService {

    private queue: WebSocket[]
    private partners: Map<WebSocket, WebSocket>

    constructor() {
        this.queue = [];
        this.partners = new Map<WebSocket, WebSocket>()
    }

    public findPairedClient (client: WebSocket) {
        return this.partners.get(client)
    }

    public addClientToQueue (client: WebSocket) {
        if (this.queue.includes(client) || this.partners.has(client)) {
            return
        }
        if (client !== null && this.queue.length < 1) {
            this.queue.push(client)
        } else {
            const waitingClient = this.queue.shift()

            if (!waitingClient) {
                return
            }

            if (waitingClient) {
                this.partners.set(client, waitingClient)
                this.partners.set(waitingClient, client)
            }

            return {
                initiator: waitingClient,
                receiver: client
            }
        }
    }

}
