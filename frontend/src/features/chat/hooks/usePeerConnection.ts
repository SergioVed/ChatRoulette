import {useEffect, useRef, useState} from "react";
import PeerSession from "../rtc/peerSession.ts";


export function usePeerConnection (
    onIceCandidate: (candidate: RTCIceCandidate) => void
) {

    const peerConnection = useRef<PeerSession | null>(null)
    const unsubscribeConnectionRef = useRef<(() => void) | null>(null);

    const [remoteStream, setRemoteStream] =
        useState<MediaStream | null>(null);

    const [connectionState, setConnectionState] =
        useState<RTCPeerConnectionState>("new");

    function setupPeerConnection () {
        const peer = new PeerSession()

        peer.onRemoteStream((streams) => {
            setRemoteStream(streams[0] ?? null)
        })

        peer.sendIceCandidate(onIceCandidate)
        unsubscribeConnectionRef.current = peer.onConnectionStateChange(setConnectionState)

        peerConnection.current = peer
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
        setupPeerConnection()
    }

    function getPeerConnection(): PeerSession {
        if (!peerConnection.current) {
            throw new Error("Peer connection is null");
        }

        return peerConnection.current;
    }

    useEffect(() => {
        setupPeerConnection();

        return () => cleanUpCall();
    }, []);


    return {
        remoteStream,
        connectionState,
        cleanUpCall,
        replacePeerConnection,
        getPeerConnection
    }
}