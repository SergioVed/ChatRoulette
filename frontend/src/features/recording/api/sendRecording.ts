import {apiRequest} from "../../../shared/api/http.ts";

export async function sendRecording (audioBlob: Blob, token: string) {

    const formData = new FormData()
    formData.append("audio", audioBlob, 'recording.webm');

    const data = await apiRequest("AISummary/audio", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    })

    return data
}
