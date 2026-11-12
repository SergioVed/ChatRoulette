import styles from "../../../pages/call/SetupPage.module.css";
import {useEffect, useRef} from "react";

interface VideoPreviewProps {
    stream: MediaStream | null,
}

export const VideoPreview = ({stream}: VideoPreviewProps) => {

    const videoRef = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        video.srcObject = stream

        return () => {
            video.srcObject = null
        }
    }, [stream])

    return (
        <>
            <video
                ref={videoRef}
                className={styles.video}
                aria-label="Local camera preview placeholder"
                autoPlay
                muted
                playsInline
            />
        </>
    )

}