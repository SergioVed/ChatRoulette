import {API_BASE_URL} from "../../../shared/api/http.ts";

export async function sendRecording (audioBlob: Blob, token: string) {

    const formData = new FormData()
    formData.append("audio", audioBlob, 'recording.webm');

    try {
        const response = await fetch(`${API_BASE_URL}/AISummary`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData
        })

        if (!response.ok) {
            throw new Error(`Failed to upload ${response.status}`)
        }

        const data = response.json()

        console.log(data)
    } catch (error) {
        console.error("Failed to upload recording:", error);
        throw error;
    }

}