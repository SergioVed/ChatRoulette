import {API_BASE_URL} from "../../../shared/api/http.ts";

export async function sendRecording (audioBlob: Blob) {

    const formData = new FormData()
    formData.append("audio", audioBlob, 'recording.webm');

    try {
        const response = await fetch(`${API_BASE_URL}/AISummary`, {
            method: "POST",
            body: formData
        })

        if (!response.ok) {

        }

        const data = response.json()

        console.log(data)
    } catch (error) {

    }

}