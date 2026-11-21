import {Message} from "./message";
import {EventType} from "../types";

export class MatchedMessage extends Message<{initiator: boolean}>{

    constructor(value: boolean) {
        super(EventType.MATCHED, {initiator: value})
    }

}