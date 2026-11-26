import {apiRequest} from "../../../shared/api/http.ts";

export async function sendRecording (callId: string, audioBlob: Blob, token: string) {

    const formData = new FormData()
    formData.append("audio", audioBlob, 'recording.webm');
    formData.append("callId", callId);

    const data = await apiRequest("AISummary", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,

        },
        body: formData,
    })

    return data
}
