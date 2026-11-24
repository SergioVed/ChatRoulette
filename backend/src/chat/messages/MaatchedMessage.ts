import {Message} from "./message";
import {EventType} from "../types";

interface MatchedMessageProps {
    initiator: boolean,
    userName: string,
    skillName: string
}

export class MatchedMessage extends Message<MatchedMessageProps>{

    constructor(value: boolean, userName: string, skillName: string) {
        super(EventType.MATCHED, {
            initiator: value,
            userName: userName,
            skillName: skillName
        })
    }
}