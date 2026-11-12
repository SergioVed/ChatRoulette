import styles from "../../../pages/call/SetupPage.module.css";
import {useEffect, useRef} from "react";

interface VideoPreviewProps {
    stream: MediaStream | null,
    className?: string,
    muted?: boolean,
    ariaLabel?: string,
}

export const VideoPreview = ({
    stream,
    className = styles.video,
    muted = true,
    ariaLabel = 'Local camera preview placeholder',
}: VideoPreviewProps) => {

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
                className={className}
                aria-label={ariaLabel}
                autoPlay
                muted={muted}
                playsInline
            />
        </>
    )

}
