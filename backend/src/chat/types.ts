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
    user: UserData
    skill: SkillData,
    role: UserSkillRole
}

export interface UserData {
    userId: string,
    name: string
}

export interface SkillData {
    skillId: string,
    name: string
}

export interface AuthenticatedUser {
    userId: string,
    exp: number
}

export interface PairedUsersResponse {
    callId: string,
    initiator: {
        name: string,
        socket: WebSocket
    },
    receiver: {
        name: string,
        socket: WebSocket
    },
    skillName: string
}
