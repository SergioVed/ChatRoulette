import {type Dispatch, type SetStateAction, useEffect, useRef, useState} from "react";
import {ConversationSocket} from "../transport/conversationSocket.ts";
import PeerSession from "../rtc/peerSession.ts";
import {WS_BASE_URL} from "../../../shared/api/http.ts";
import {EventType} from "../transport/types.ts";


export function useConversation (localStream: MediaStream | null) {

    const socket = useRef<ConversationSocket | null>(null)
    const peerConnection = useRef<PeerSession | null>(null)
    const unsubscribeConnectionRef = useRef<(() => void) | null>(null)
    const localStreamRef = useRef<MediaStream | null>(localStream)

    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
    const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>('new')

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
            switch (message.event) {
                case EventType.MATCHED: {
                    const transport = socket
                    const stream = localStreamRef.current

                    if (!peerConnection.current || !transport || !stream) {
                        throw new Error('Local media is not ready')
                    }

                    await peerConnection.current.addLocalStream(stream)

                    if (message.data.initiator) {
                        const description = await peerConnection.current.createOffer()

                        transport.current.sendMessage({
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
                    const answer = await peerConnection.current.handleOffer(message.data.description);
                    socket.current.sendMessage({
                        event: EventType.ANSWER,
                        data: {description: answer}
                    })

                    break;
                }

                case EventType.ANSWER: {
                    await peerConnection.current.handleAnswer(message.data.description)
                    break
                }

                case EventType.ICE_CANDIDATE: {
                    await peerConnection.current.handleCandidate(
                        new RTCIceCandidate(message.data.candidate)
                    )

                    break
                }
            }
        })

        return () => {
            unsubscribeConnectionRef.current()
            socket.current.close();
            peerConnection.current.close();
        }
    }, [])


    function setupPeerConnection (setConnectionState: Dispatch<SetStateAction<RTCPeerConnectionState>>) {
        const peerSession = new PeerSession()

        peerSession.onRemoteStream((streams) => {
            setRemoteStream(streams[0] ?? null)
            console.log("remote stream received")
        })

        peerSession.sendIceCandidate((candidate) => {
            socket.current.sendMessage({
                event: EventType.ICE_CANDIDATE,
                data: {
                    candidate: candidate.toJSON(),
                },
            })
        })

        const unsubscribeConnection = peerSession.onConnectionStateChange(setConnectionState)
        return {peerSession, unsubscribeConnection}
    }

    function replacePeerConnection () {
        peerConnection.current.close()
        peerConnection.current = null

        unsubscribeConnectionRef.current()
        unsubscribeConnectionRef.current = null

        const { peerSession, unsubscribeConnection } =
            setupPeerConnection(setConnectionState)

        peerConnection.current = peerSession
        unsubscribeConnectionRef.current = unsubscribeConnection

        setRemoteStream(null)
    }




    async function findPartner () {
        replacePeerConnection()

        socket.current.sendMessage({
            event: EventType.FIND_PARTNER
        })
    }

    async function endCall () {
        socket.current.sendMessage({
            event: EventType.END_CALL,
            data: {initiator: true}
        })

        await peerConnection.current.close()
        setRemoteStream(null)
        setConnectionState('closed')
        unsubscribeConnectionRef.current()
    }

    return {remoteStream, findPartner, endCall, isConnected: connectionState === 'connected'}
}
