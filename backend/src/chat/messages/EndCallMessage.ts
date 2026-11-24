
import {Message} from "./message";
import {EventType} from "../types";

export class EndCallMessage extends Message<{initiator: boolean, acknowledged?: boolean}>{

    constructor(value: boolean, acknowledged = false) {
        super(EventType.END_CALL, acknowledged ? {initiator: value, acknowledged} : {initiator: value})
    }

}