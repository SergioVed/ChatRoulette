import {useEffect, useRef, useState} from "react";
import {ConversationSocket} from "../transport/conversationSocket.ts";
import PeerSession from "../rtc/peerSession.ts";
import {WS_BASE_URL} from "../../../shared/api/http.ts";
import {EventType} from "../transport/types.ts";


export function useConversation (localStream: MediaStream | null) {

    const socket = useRef<ConversationSocket | null>(null)
    const peerConnection = useRef<PeerSession | null>(null)
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)

    const localStreamRef = useRef<MediaStream | null>(localStream)

    useEffect(() => {
        localStreamRef.current = localStream
    }, [localStream])

    useEffect(() => {
        socket.current = new ConversationSocket(WS_BASE_URL)
        peerConnection.current = new PeerSession()

        peerConnection.current.onRemoteStream((streams) => {
            setRemoteStream(streams[0] ?? null)
            console.log(remoteStream)
        })

        peerConnection.current.sendIceCandidate((candidate) => {
            socket.current.sendMessage({
                event: EventType.ICE_CANDIDATE,
                data: {
                    candidate: candidate.toJSON(),
                },
            })
        })

        socket.current.onMessage(async (message) => {
            switch (message.event) {
                case EventType.MATCHED: {
                    const peer = peerConnection.current
                    const transport = socket.current
                    const stream = localStreamRef.current

                    if (!peer || !transport || !stream) {
                        throw new Error('Local media is not ready')
                    }

                    await peer.addLocalStream(stream)

                    if (message.data.initiator) {
                        const description = await peer.createOffer()

                        transport.sendMessage({
                            event: EventType.OFFER,
                            data: { description },
                        })
                    }

                    break
                }

                case EventType.OFFER: {
                    const answer = await peerConnection.current.handleOffer(message.data.description);
                    socket.current.sendMessage({
                        event: EventType.ANSWER,
                        data: {description: answer}
                    })

                    console.log("offer received")

                    break;
                }

                case EventType.ANSWER: {
                    await peerConnection.current.handleAnswer(message.data.description)

                    console.log("answer received")

                    break
                }

                case EventType.ICE_CANDIDATE: {
                    await peerConnection.current.handleCandidate(
                        new RTCIceCandidate(message.data.candidate)
                    )

                    console.log("ice")

                    break
                }
            }
        })

        return () => {
            socket.current.close();
            peerConnection.current.close();
        }
    }, [])

    async function findPartner () {
        socket.current.sendMessage({
            event: EventType.FIND_PARTNER
        })
    }


    return {remoteStream, findPartner}

}
