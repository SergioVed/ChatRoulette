import {useEffect, useRef} from "react";
import {ConversationSocket} from "../transport/conversationSocket.ts";
import PeerSession from "../rtc/peerSession.ts";
import {API_BASE_URL} from "../../../shared/api/http.ts";
import {EventType} from "../transport/types.ts";


export function useConversation () {

    const socket = useRef<ConversationSocket | null>(null)
    const peerConnection = useRef<PeerSession | null>(null)

    useEffect(() => {
        socket.current = new ConversationSocket(API_BASE_URL)
        peerConnection.current = new PeerSession()

        socket.current.onMessage(async (message) => {
            switch (message.event) {
                case EventType.MATCHED: {
                    break;
                }

                case EventType.OFFER: {
                    break
                }

                case EventType.ANSWER: {
                    break
                }
            }
        })

        return () => {
            socket.current.close();
            peerConnection.current.close();
        }
    }, [])


    function findPartner () {

    }

    return {findPartner}

}
