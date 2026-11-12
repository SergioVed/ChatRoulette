export enum EventType {
    CONNECTED = 'connected',
    DISCONNECTED = 'disconnected',
    FIND_PARTNER = 'find-partner',
    MATCHED = 'matched',
    OFFER = 'offer',
    ANSWER = 'answer',
    ICE_CANDIDATE = 'ice-candidate',
}

export type ServerMessage =
    | {event: EventType.FIND_PARTNER}
    | { event: EventType.CONNECTED; data: { message: string } }
    | { event: EventType.DISCONNECTED; data: { message: string } }
    | { event: EventType.MATCHED; data: { initiator: boolean } }
    | { event: EventType.OFFER | EventType.ANSWER; data: { description: RTCSessionDescriptionInit } }
    | { event: EventType.ICE_CANDIDATE; data: { candidate: RTCIceCandidateInit }
}