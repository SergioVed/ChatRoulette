import type {ServerMessage} from "./types.ts";


export class ConversationSocket {

    private socket: WebSocket

    constructor(API_URL: string) {
        this.socket = new WebSocket(API_URL)
    }

    onMessage(handler: (message: ServerMessage) => void){
        this.socket.onmessage = (event: MessageEvent) => {
            handler(event.data)
        }
    }

    sendMessage(message: ServerMessage){
        this.socket.send(JSON.stringify(message))
    }

    close(){
        this.socket.close()
    }

}