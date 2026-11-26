import {useRef} from "react";
import {useUserContext} from "../../shared/hooks/useUserContext.ts";
import {sendRecording} from "../api/sendRecording.ts";


export function useMediaRecord () {

    const {token} = useUserContext()
    const chunks = useRef<Blob[]>([])
    const recorder = useRef<MediaRecorder | null>(null)

    function createMediaRecoder (stream: MediaStream) {
        recorder.current = new MediaRecorder(stream);
    }

    function startRecording () {
        const currentRecorder = recorder.current;
        if (currentRecorder == null) {
            return;
        }

        currentRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                chunks.current.push(event.data)
            }
        }

        currentRecorder.start();
    }

    function stopRecording (callId: string, shouldUpload: boolean) {
        const currentRecorder = recorder.current;
        if (currentRecorder == null || currentRecorder.state === "inactive") {
            return;
        }

        currentRecorder.onstop = () => {
            const recordedChunks = chunks.current
            chunks.current = []

            if (shouldUpload && token) {
                const audioBlob = new Blob(recordedChunks, {
                    type: currentRecorder.mimeType
                })
                void sendRecording(callId, audioBlob, token)
            }
        }

        currentRecorder.stop()
    }



    return {createMediaRecoder, startRecording, stopRecording}
}
