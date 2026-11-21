import {Message} from "./message";
import {EventType} from "../types";


export class ConnectionMessage extends Message<{message: string}> {

    constructor(event: EventType, message: string) {
        super(event, {message});
    }

}