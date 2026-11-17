export enum EventType {
    CONNECTED = 'connected',
    DISCONNECTED = 'disconnected',
    FIND_PARTNER = 'find-partner',
    END_CALL = 'end-call',
    MATCHED = 'matched',
    OFFER = 'offer',
    ANSWER = 'answer',
    AUTHENTICATE="authenticate",
    ICE_CANDIDATE = 'ice-candidate',
}

export type ServerMessage =
    | {event: EventType.AUTHENTICATE, data: {accessToken: string}}
    | {event: EventType.END_CALL, data: {initiator: boolean}}
    | {event: EventType.FIND_PARTNER, data: {skillId: string}}
    | { event: EventType.CONNECTED; data: { message: string } }
    | { event: EventType.DISCONNECTED; data: { message: string } }
    | { event: EventType.MATCHED; data: { initiator: boolean } }
    | { event: EventType.OFFER | EventType.ANSWER; data: { description: RTCSessionDescriptionInit } }
    | { event: EventType.ICE_CANDIDATE; data: { candidate: RTCIceCandidateInit }
}