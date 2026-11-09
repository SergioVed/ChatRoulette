import './App.css'
import {useEffect, useRef} from "react";

function App() {

    let socket: WebSocket;
    const peerConnection = useRef<RTCPeerConnection | null>(null)

    const localStreamRef = useRef<MediaStream | null>(null);
    const localVideoRef = useRef<HTMLVideoElement | null>(null);

    const remoteVideoRef = useRef<HTMLVideoElement | null>(null)
    const mediaReadyRef = useRef<Promise<void> | null>(null)
    const pendingCandidates = useRef<RTCIceCandidateInit[]>([])

    function startCamera() {
        if (!mediaReadyRef.current) {
            const connection = peerConnection.current
            mediaReadyRef.current = (async () => {
                if (!connection) throw new Error('Peer connection is not ready')
                if (!navigator.mediaDevices?.getUserMedia) {
                    throw new Error('Camera and microphone require HTTPS or localhost')
                }
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                if (peerConnection.current !== connection) {
                    stream.getTracks().forEach((track) => track.stop())
                    throw new Error('Media setup was cancelled')
                }
                localStreamRef.current = stream
                if (localVideoRef.current) localVideoRef.current.srcObject = stream
                stream.getTracks().forEach((track) => connection.addTrack(track, stream))
            })().catch((error) => {
                mediaReadyRef.current = null
                throw error
            })
        }
        return mediaReadyRef.current
    }

    useEffect(() => {
        setupConnection()
        listenMessages()
        return () => {
            localStreamRef.current?.getTracks().forEach((track) => track.stop())
            localStreamRef.current = null
            mediaReadyRef.current = null
            peerConnection.current = null
            pendingCandidates.current = []
        }
    }, [])

    function setupConnection () {
        pendingCandidates.current = []
        socket = new WebSocket("ws://localhost:4321")
        peerConnection.current = new RTCPeerConnection({
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" },
            ],
        })

        const remoteStream = new MediaStream()
        peerConnection.current.ontrack = (event) => {
            remoteStream.addTrack(event.track)
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0] ?? remoteStream
            }
        }

        peerConnection.current.onicecandidate = (event) => {
            if (event.candidate && socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({
                    event: 'ice-candidate',
                    data: { candidate: event.candidate.toJSON() }
                }))
            }
        }
    }

    function listenMessages () {
        socket.onmessage = async (event) => {
            const receivedMessage = JSON.parse(event.data)
            const eventType = receivedMessage.event

            switch (eventType) {
                case 'connected': {
                    const message = receivedMessage.data.message
                    console.log(message)
                    break
                }
                case 'disconnected': {
                    const message = receivedMessage.data.message
                    console.log(message)
                    break
                }
                case 'matched': {
                    const initiator = receivedMessage.data.initiator
                    if (initiator) sendOffer()
                    break
                }
                case 'offer': {
                    console.log('offer')
                    await answerToOffer(receivedMessage.data.description)
                    break
                }
                case 'answer': {
                    console.log('answer')
                    const connection = peerConnection.current
                    if (!connection) break
                    await connection.setRemoteDescription(
                        receivedMessage.data.description
                    )
                    await applyPendingCandidates(connection)
                    break
                }
                case 'ice-candidate': {
                    const connection = peerConnection.current
                    if (!connection) break
                    const candidate = receivedMessage.data.candidate
                    if (connection.remoteDescription) {
                        await connection.addIceCandidate(candidate)
                    } else {
                        pendingCandidates.current.push(candidate)
                    }
                    break
                }
            }
        }
    }

    async function applyPendingCandidates (connection: RTCPeerConnection) {
        const candidates = pendingCandidates.current
        pendingCandidates.current = []
        for (const candidate of candidates) {
            await connection.addIceCandidate(candidate)
        }
    }

    async function sendOffer () {
        await startCamera()
        const offer = await peerConnection.current!.createOffer()

        await peerConnection.current!.setLocalDescription(offer)

        socket.send(JSON.stringify({
            event: 'offer',
            data: {
                description: peerConnection.current!.localDescription
            }
        }))
    }

    async function answerToOffer (description: RTCSessionDescriptionInit) {
        await startCamera()
        const connection = peerConnection.current
        if (!connection) {
            throw new Error('Peer connection is not initialized')
        }

        await connection.setRemoteDescription(description)
        await applyPendingCandidates(connection)
        const answer = await connection.createAnswer()
        await connection.setLocalDescription(answer)

        socket.send(JSON.stringify({
            event: 'answer',
            data: {
                description: connection.localDescription
            }
        }))
    }

    async function findPartner () {
        try {
            await startCamera()
            // Browsers may require a user gesture to start playback with audio.
            void remoteVideoRef.current?.play().catch(() => undefined)
        } catch (error) {
            return
        }
        const message = {
            event: "find-partner",
            data: {
                message: "I want to find a partner"
            }
        }
        socket.send(JSON.stringify(message))
    }

  return (
      <>
          <video id={"localVideo"} ref={localVideoRef} autoPlay muted playsInline> </video>
          <video ref={remoteVideoRef} autoPlay playsInline controls> </video>
          <button onClick={findPartner}>find partner</button>
      </>
  )
}

export default App
