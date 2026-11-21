import {sendRecording} from "../api/sendRecording.ts";


export function useMediaRecord () {

    const chunks: Blob[] = []
    let recorder: MediaRecorder;

    function createMediaRecoder (stream: MediaStream) {
        recorder = new MediaRecorder(stream);
    }

    function startRecording () {
        console.log("started recording")

        recorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                chunks.push(event.data)
            }
        }

        recorder.start();
    }

    function stopRecording () {
        console.log("stoped recording")

        recorder.stop()

        recorder.onstop = () => {
            const audioBlob = new Blob(chunks, {
                type: recorder.mimeType
            })

            void sendRecording(audioBlob)
        }
    }

    return {createMediaRecoder, startRecording, stopRecording}
}