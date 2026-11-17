import {UserSkillRole} from "../user-skills/types";

export enum EventType {
    AUTHENTICATE="authenticate",
    END_CALL="end-call",
    MATCHED="matched",
    CONNECTED="connected",
    DISCONNECTED="disconnected",
    ICE_CANDIDATE = "ice-candidate",
    ANSWER="answer",
    OFFER="offer",
    FIND_PARTNER="find-partner"
}

export interface QueueObj {
    client: WebSocket,
    userId: string,
    skillId: string,
    role: UserSkillRole
}