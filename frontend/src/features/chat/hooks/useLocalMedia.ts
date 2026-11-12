import {useEffect, useState} from "react";


export function useLocalMedia () {
    const [stream, setStream] = useState<MediaStream | null>(null)

    useEffect(() => {
        let active = true
        let localStream: MediaStream | null = null

        async function start() {
            try {
                const acquired = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true,
                })

                if (!active) {
                    acquired.getTracks().forEach((track) => track.stop())
                    return
                }

                localStream = acquired
                setStream(acquired)

            } catch (error) {
                if (active) console.error('Unable to access camera:', error)
            }
        }
        start()

        return () => {
            active = false
            localStream?.getTracks().forEach((track) => track.stop())
        }
    }, [])

    function toggleMicrophone () {
        const enable = stream.getTracks()[0].enabled
        stream.getTracks()[0].enabled = !enable;
    }

    function toggleVideo () {
        const enable = stream.getTracks()[1].enabled
        stream.getTracks()[1].enabled = !enable;
    }

    return {stream, toggleMicrophone, toggleVideo}
}