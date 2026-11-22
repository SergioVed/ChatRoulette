import {UserSkillRole} from "../user-skills/types";
import type WebSocket from 'ws';

export enum EventType {
    AUTHENTICATE = "authenticate",
    AUTHENTICATED = "authenticated",
    ERROR = "error",
    QUEUED = "queued",

    NEXT="next",
    END_CALL="end-call",
    MATCHED="matched",
    CONNECTED="connected",
    DISCONNECTED="disconnected",
    ICE_CANDIDATE = "ice-candidate",
    ANSWER="answer",
    OFFER="offer",
    FIND_PARTNER="find-partner"
}

export enum ErrorCode {
    AUTH_REQUIRED = "AUTH_REQUIRED",
    SKILL_NOT_ASSIGNED = "SKILL_NOT_ASSIGNED",
    MATCHMAKING_UNAVAILABLE = "MATCHMAKING_UNAVAILABLE",
    INTERNAL_ERROR = "INTERNAL_ERROR",
}

export interface QueueObj {
    client: WebSocket,
    userId: string,
    skillId: string,
    role: UserSkillRole
}

export interface AuthenticatedUser {
    userId: string,
    exp: number
}