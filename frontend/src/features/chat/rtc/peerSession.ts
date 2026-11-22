class PeerSession {

    private connection: RTCPeerConnection
    private pendingCandidates: Array<RTCIceCandidate> = []

    constructor() {
        this.connection = new RTCPeerConnection({
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" },
            ],
        })
    }


    async handleOffer(description: RTCSessionDescriptionInit) {
        await this.connection.setRemoteDescription(description)
        const answer = await this.connection.createAnswer();

        await this.connection.setLocalDescription(answer)

        this.flushPendingCandidates()

        return answer;
    }

    async handleAnswer(description: RTCSessionDescriptionInit){
        await this.connection.setRemoteDescription(description)
        this.flushPendingCandidates()
    }

    async createOffer(){
        const description = await this.connection.createOffer()
        await this.connection.setLocalDescription(description)

        return description;
    }

    sendIceCandidate(handler: (candidate: RTCIceCandidate) => void) {
        this.connection.onicecandidate = (event) => {
            if (event.candidate) handler(event.candidate)
        }
    }

    async handleCandidate(candidate: RTCIceCandidate){
        if (!this.connection.remoteDescription) {
            this.pendingCandidates.push(candidate)
        } else {
            await this.connection.addIceCandidate(candidate)
        }
    }

    async addLocalStream(stream: MediaStream) {
        stream.getTracks().forEach((track) => {
            this.connection.addTrack(track, stream)
        })
    }

    onRemoteStream (handler: (streams: MediaStream[]) => void) {
        this.connection.ontrack = (event) => {
            handler([...event.streams])
        }
    }

    onConnectionStateChange(handler: (state: RTCPeerConnectionState) => void): () => void {
        const listener = () => {
            handler(this.connection.connectionState)
        }

        this.connection.addEventListener('connectionstatechange', listener)
        listener()

        return () => {
            this.connection.removeEventListener('connectionstatechange', listener)
        }
    }

    async close() {
        this.connection.close()
    }


    private async flushPendingCandidates () {
        if (this.pendingCandidates.length !== 0) {
            for (const candidate of this.pendingCandidates) {
                await this.connection.addIceCandidate(candidate)
            }
        }

        this.pendingCandidates = []
    }

}

export default PeerSession