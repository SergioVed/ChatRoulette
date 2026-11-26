import {Message} from "./message";
import {EventType} from "../types";

interface MatchedMessageProps {
    callId: string,
    initiator: boolean,
    userName: string,
    skillName: string
}

export class MatchedMessage extends Message<MatchedMessageProps>{

    constructor(value: boolean, userName: string, skillName: string, callId: string) {
        super(EventType.MATCHED, {
            callId,
            initiator: value,
            userName: userName,
            skillName: skillName
        })
    }
}
