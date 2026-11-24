import type {ServerMessage} from "./types.ts";


export class ConversationSocket {

    private socket: WebSocket

    constructor(API_URL: string) {
        this.socket = new WebSocket(API_URL)
    }

    get isOpen() {
        return this.socket.readyState === WebSocket.OPEN
    }

    onClose(handler: () => void) {
        this.socket.onclose = handler
    }

    onMessage(handler: (message: ServerMessage) => void){
        this.socket.onmessage = (event: MessageEvent) => {
            handler(JSON.parse(event.data))
        }
    }

    sendMessage(message: ServerMessage){
        this.socket.send(JSON.stringify(message))
    }

    close(){
        this.socket.onmessage = null
        this.socket.onclose = null
        this.socket.close()
    }

}