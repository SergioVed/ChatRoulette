
import {Message} from "./message";
import {EventType} from "../types";

export class EndCallMessage extends Message<{initiator: boolean}>{

    constructor(value: boolean) {
        super(EventType.END_CALL, {initiator: value})
    }

}