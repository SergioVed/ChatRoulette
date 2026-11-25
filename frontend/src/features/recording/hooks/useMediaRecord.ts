import {sendRecording} from "../api/sendRecording.ts";
import {useRef} from "react";
import {useUserContext} from "../../shared/hooks/useUserContext.ts";


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

    function stopRecording (skillId: string) {
        const currentRecorder = recorder.current;
        if (currentRecorder == null) {
            return;
        }

        currentRecorder.stop()

        currentRecorder.onstop = () => {
            const audioBlob = new Blob(chunks.current, {
                type: currentRecorder.mimeType
            })

            void sendRecording(skillId, audioBlob, token)
        }
    }

    return {createMediaRecoder, startRecording, stopRecording}
}