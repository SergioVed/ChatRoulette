import {useEffect, useRef, useState} from "react";
import {ConversationSocket} from "../transport/conversationSocket.ts";
import {WS_BASE_URL} from "../../../shared/api/http.ts";
import {ErrorCode, EventType, type ServerMessage} from "../transport/types.ts";
import {useUserContext} from "../../shared/hooks/useUserContext.ts";
import {usePeerConnection} from "./usePeerConnection.ts";
import {ConversationState, type Partner} from "../types.ts";
import {useLogout} from "../../auth/hooks/useLogout.tsx";
import {useMediaRecord} from "../../recording/hooks/useMediaRecord.ts";
import {getCombinedStreams} from "../../recording/utils/createMixedAudioStream.ts";


export function useConversation (localStream: MediaStream | null) {

    const {token} = useUserContext()
    const {logout} = useLogout()
    const {startRecording, createMediaRecoder, stopRecording} = useMediaRecord()

    const {
        remoteStream,
        connectionState,
        cleanUpCall,
        replacePeerConnection,
        getPeerConnection
    } = usePeerConnection((candidate) => {
        const transport = socket.current;

        if (!transport) {
            throw new Error("Transport is null");
        }

        transport.sendMessage({
            event: EventType.ICE_CANDIDATE,
            data: {
                candidate: candidate.toJSON()
            }
        });
    })
    const socket = useRef<ConversationSocket | null>(null)
    const localStreamRef = useRef<MediaStream | null>(localStream)
    const callIdRef = useRef<string | null>(null)
    const isInitiatorRef = useRef<boolean>(false)

    const [socketReady, setSocketReady] = useState<boolean>(false)
    const [conversationState, setConversationState] = useState<ConversationState>(ConversationState.IDLE)
    const [connectionError, setConnectionError] = useState<string>('')

    const [authenticated, setAuthenticated] = useState<boolean>(false)
    const [partner, setPartner] = useState<Partner | null>(null)

    function finishCall (replace = false) {
        const callId = callIdRef.current
        if (callId !== null) {
            stopRecording(callId, isInitiatorRef.current)
        }

        if (replace) {
            replacePeerConnection()
        } else {
            cleanUpCall()
        }
        callIdRef.current = null
        isInitiatorRef.current = false
    }










    useEffect(() => {
        if (connectionState === 'connected' && localStream !== null && remoteStream !== null) {
            const stream = getCombinedStreams(localStream, remoteStream)
            createMediaRecoder(stream)

            startRecording()
        }

    }, [connectionState, remoteStream, localStream])

    useEffect(() => {
        localStreamRef.current = localStream
    }, [localStream])


    useEffect(() => {
        const transport = new ConversationSocket(WS_BASE_URL)
        socket.current = transport

        transport.onMessage(async (message) => {
            try {
                await handleMessages(message)
            } catch (error) {
                setConnectionError("Couldn't connect to partner")
            }
        })

        transport.onClose(() => {
            finishCall()
            setAuthenticated(false)
            setSocketReady(false)
            setPartner(null)
            setConversationState(ConversationState.IDLE)
        })

        return () => {
            transport.close()
            socket.current = null
            callIdRef.current = null
            isInitiatorRef.current = false
            setPartner(null)
        }
    }, [])












    async function handleMessages (message: ServerMessage) {
        switch (message.event) {
            case EventType.MATCHED: {
                const {callId, initiator} = message.data
                callIdRef.current = callId
                isInitiatorRef.current = initiator
                setConversationState(ConversationState.MATCHED)

                const transport = socket.current
                const stream = localStreamRef.current
                const peer = getPeerConnection()
                if (!peer || !transport || !stream) {
                    throw new Error('Local media is not ready')
                }

                await peer.addLocalStream(stream)
                if (callIdRef.current !== callId) break

                const partner:Partner = {
                    name: message.data.userName,
                    skill: message.data.skillName
                }
                setPartner(partner)

                if (initiator) {
                    const description = await peer.createOffer()
                    if (callIdRef.current !== callId) break

                    transport.sendMessage({
                        event: EventType.OFFER,
                        data: {description},
                    })
                }
                break
            }

            case EventType.END_CALL: {
                setConversationState(ConversationState.IDLE)
                finishCall(true)
                break;
            }

            case EventType.OFFER: {
                const peer = getPeerConnection()
                const transport = socket.current
                if (!peer || !transport) {
                    throw new Error('Peer connection or transport is null')
                }

                const answer = await peer.handleOffer(message.data.description);
                transport.sendMessage({
                    event: EventType.ANSWER,
                    data: {description: answer}
                })

                break;
            }

            case EventType.ANSWER: {
                const peer = getPeerConnection()
                if (!peer) {
                    throw new Error('Peer connection is null')
                }

                await peer.handleAnswer(message.data.description)
                break
            }

            case EventType.ICE_CANDIDATE: {
                const peer = getPeerConnection()
                if (!peer) {
                    throw new Error('Peer connection is null')
                }
                await peer.handleCandidate(new RTCIceCandidate(message.data.candidate))

                break
            }

            case EventType.CONNECTED: {
                const transport = socket.current

                if (!transport) {
                    throw new Error('Transport is null')
                }

                if (!token) {
                    return
                }

                transport.sendMessage({
                    event: EventType.AUTHENTICATE,
                    data: {accessToken: token}
                })
                setSocketReady(true)

                break;
            }

            case EventType.ERROR: {
                const code = message.data.code
                handleError(code)
                setConversationState(ConversationState.IDLE)
                break
            }

            case EventType.AUTHENTICATED: {
                setAuthenticated(true)
                break
            }
        }
    }

    function handleError (code: ErrorCode) {
        switch (code) {
            case ErrorCode.AUTH_REQUIRED: {
                setConnectionError("Your session has expired. Please log in again.");
                setConversationState(ConversationState.IDLE)
                logout()
                break
            }
            case ErrorCode.INTERNAL_ERROR: {
                setConnectionError("Something went wrong. Please try again.");
                break;
            }
            case ErrorCode.MATCHMAKING_UNAVAILABLE: {
                setConnectionError("Matchmaking is currently unavailable.");
                setConversationState(ConversationState.IDLE);
                break;
            }
            case ErrorCode.SKILL_NOT_ASSIGNED: {
                setConnectionError("You dont have skills to connect with people")
                setConversationState(ConversationState.IDLE);
                break;
            }
        }
    }

    async function findPartner (skillId: string) {
        setConnectionError('')

        if (!authenticated) {
            return
        }

        const transport = socket.current
        if (!transport) {
            throw new Error('Transport is null')
        }


        finishCall(true)

        transport.sendMessage({
            event: EventType.FIND_PARTNER,
            data: {skillId: skillId}
        })
        setConversationState(ConversationState.SEARCHING)
    }

    async function endCall () {
        setConversationState(ConversationState.IDLE)
        finishCall()

        const transport = socket.current
        if (!transport) {
            throw new Error('Transport is null')
        }

        transport.sendMessage({
            event: EventType.END_CALL,
            data: {initiator: true}
        })

        setPartner(null)
    }

    async function next (skillId: string) {
        const transport = socket.current
        if (!transport) {
            throw new Error('Transport is null')
        }

        finishCall(true)

        transport.sendMessage({
            event: EventType.NEXT,
            data: {skillId: skillId}
        })
        setConversationState(ConversationState.SEARCHING)
    }

    // async function testDisc(){
    //     const transport = socket.current
    //     if (!transport) {
    //         throw new Error('Transport is null')
    //     }
    //
    //     replacePeerConnection()
    //
    //     transport.sendMessage({
    //         event: EventType.TEST_DISC,
    //     })
    // }


    return {
        remoteStream,
        connectionState,
        connectionError,
        socketReady,
        partner,
        conversationState,

        findPartner,
        endCall,
        next
    }
}
