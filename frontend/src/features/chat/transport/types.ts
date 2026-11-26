export enum EventType {
    NEXT="next",
    CONNECTED = 'connected',
    DISCONNECTED = 'disconnected',
    FIND_PARTNER = 'find-partner',
    END_CALL = 'end-call',
    MATCHED = 'matched',
    OFFER = 'offer',
    ANSWER = 'answer',
    AUTHENTICATE="authenticate",
    AUTHENTICATED="authenticated",
    ICE_CANDIDATE = 'ice-candidate',
    ERROR = 'error'
    // TEST_DISC = 'test_disc'
}

export type ServerMessage =
    | {event: EventType.ERROR, data: {code: ErrorCode}}
    | {event: EventType.AUTHENTICATED}
    | {event: EventType.NEXT, data: {skillId: string}}
    | {event: EventType.AUTHENTICATE, data: {accessToken: string}}
    | {event: EventType.END_CALL, data: {initiator: boolean, cancelSearch?: boolean, acknowledged?: boolean}}
    | {event: EventType.FIND_PARTNER, data: {skillId: string}}
    | { event: EventType.CONNECTED; data: { message: string } }
    | { event: EventType.DISCONNECTED; data: { message: string } }
    | { event: EventType.MATCHED; data: {initiator: boolean, skillName: string, userName: string, callId: string}}
    | { event: EventType.OFFER | EventType.ANSWER; data: { description: RTCSessionDescriptionInit } }
    | { event: EventType.ICE_CANDIDATE; data: { candidate: RTCIceCandidateInit } }
        // | { event: EventType.TEST_DISC}


export enum ErrorCode {
    AUTH_REQUIRED = "AUTH_REQUIRED",
    SKILL_NOT_ASSIGNED = "SKILL_NOT_ASSIGNED",
    MATCHMAKING_UNAVAILABLE = "MATCHMAKING_UNAVAILABLE",
    INTERNAL_ERROR = "INTERNAL_ERROR",
}
