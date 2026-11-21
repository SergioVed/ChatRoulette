import {type Dispatch, type SetStateAction, useEffect, useRef, useState} from "react";
import {ConversationSocket} from "../transport/conversationSocket.ts";
import PeerSession from "../rtc/peerSession.ts";
import {WS_BASE_URL} from "../../../shared/api/http.ts";
import {EventType, type ServerMessage} from "../transport/types.ts";
import {useUserContext} from "../../shared/hooks/useUserContext.ts";
import {useMediaRecord} from "../../recording/hooks/useMediaRecord.ts";
import {getCombinedStreams} from "../../recording/utils/createMixedAudioStream.ts";


export function useConversation (localStream: MediaStream | null) {

    const {token} = useUserContext()
    const {startRecording, createMediaRecoder, stopRecording} = useMediaRecord()

    const socket = useRef<ConversationSocket | null>(null)
    const peerConnection = useRef<PeerSession | null>(null)
    const unsubscribeConnectionRef = useRef<(() => void) | null>(null)
    const localStreamRef = useRef<MediaStream | null>(localStream)

    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
    const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>('new')

    useEffect(() => {
        if (connectionState === 'connected') {
            const stream = getCombinedStreams(localStream, remoteStream)
            createMediaRecoder(stream)

            startRecording()
        }

    }, [connectionState])

    useEffect(() => {
        localStreamRef.current = localStream
    }, [localStream])


    useEffect(() => {
        // Starting up with assigning and creating connections
        socket.current = new ConversationSocket(WS_BASE_URL)
        const {unsubscribeConnection, peerSession} = setupPeerConnection(setConnectionState);

        unsubscribeConnectionRef.current = unsubscribeConnection
        peerConnection.current = peerSession;

        // Listen to incoming messages
        socket.current.onMessage(async (message) => {
            try {
                void handleMessages(message)
            } catch (error) {
                console.error(error)
            }
        })

        return () => {
            if (!unsubscribeConnectionRef.current || !socket.current || !peerConnection.current) {
                throw new Error('Connection failed');
            }

            unsubscribeConnectionRef.current()
            socket.current.close();
            peerConnection.current.close();
        }
    }, [])


    async function handleMessages (message: ServerMessage) {
        switch (message.event) {
            case EventType.MATCHED: {
                const transport = socket.current
                const stream = localStreamRef.current
                const peer = peerConnection.current

                if (!peer || !transport || !stream) {
                    throw new Error('Local media is not ready')
                }

                await peer.addLocalStream(stream)

                if (message.data.initiator) {
                    const description = await peer.createOffer()

                    transport.sendMessage({
                        event: EventType.OFFER,
                        data: {description},
                    })
                }

                break
            }

            case EventType.END_CALL: {
                replacePeerConnection()
                break;
            }

            case EventType.OFFER: {
                const peer = peerConnection.current
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
                const peer = peerConnection.current
                if (!peer) {
                    throw new Error('Peer connection is null')
                }

                await peer.handleAnswer(message.data.description)
                break
            }

            case EventType.ICE_CANDIDATE: {
                const peer = peerConnection.current
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
            }
        }
    }

     function setupPeerConnection (setConnectionState: Dispatch<SetStateAction<RTCPeerConnectionState>>) {
        const peerSession = new PeerSession()

        peerSession.onRemoteStream((streams) => {
            setRemoteStream(streams[0] ?? null)
            console.log("remote stream received")
        })

        peerSession.sendIceCandidate((candidate) => {
            const transport = socket.current
            if (!transport) {
                throw new Error('Transport is null')
            }

            transport.sendMessage({
                event: EventType.ICE_CANDIDATE,
                data: {
                    candidate: candidate.toJSON(),
                },
            })
        })

        const unsubscribeConnection = peerSession.onConnectionStateChange(setConnectionState)
        return {peerSession, unsubscribeConnection}
    }

    function cleanUpCall () {
        unsubscribeConnectionRef.current?.()
        unsubscribeConnectionRef.current = null

        peerConnection.current?.close()
        peerConnection.current = null;

        setRemoteStream(null)
        setConnectionState('closed')
    }

    function replacePeerConnection () {
        cleanUpCall()

        const { peerSession, unsubscribeConnection } =
            setupPeerConnection(setConnectionState)

        peerConnection.current = peerSession
        unsubscribeConnectionRef.current = unsubscribeConnection
    }


    async function findPartner (skillId: string) {
        const transport = socket.current
        if (!transport) {
            throw new Error('Transport is null')
        }

        replacePeerConnection()

        transport.sendMessage({
            event: EventType.FIND_PARTNER,
            data: {skillId: skillId}
        })
    }

    async function endCall () {
        const transport = socket.current
        if (!transport) {
            throw new Error('Transport is null')
        }

        transport.sendMessage({
            event: EventType.END_CALL,
            data: {initiator: true}
        })

        stopRecording()
        cleanUpCall()
    }

    async function next (skillId: string) {
        const transport = socket.current
        if (!transport) {
            throw new Error('Transport is null')
        }

        replacePeerConnection()

        transport.sendMessage({
            event: EventType.NEXT,
            data: {skillId: skillId}
        })
    }

    return {remoteStream, connectionState, findPartner, endCall, next}
}
