import {Message} from "./message";
import {EventType} from "../types";


export class AuthenticatedMessage extends Message<any> {
    constructor() {
        super(EventType.AUTHENTICATED);
    }
}