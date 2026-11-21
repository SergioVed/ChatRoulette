
export function getCombinedStreams (localStream: MediaStream, remoteStream: MediaStream) {

    const audioContext = new AudioContext();

    const destination = audioContext.createMediaStreamDestination();

    const localSource = audioContext.createMediaStreamSource(localStream);
    const remoteSource = audioContext.createMediaStreamSource(remoteStream);

    localSource.connect(destination);
    remoteSource.connect(destination);

    return destination.stream;
}
