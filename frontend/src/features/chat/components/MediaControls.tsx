import styles from "../../../pages/call/SetupPage.module.css";

interface MediaControlsProps {
    toggleMicrophone?: () => void,
    toggleVideo?: () => void
}

export const MediaControls = (
    {toggleMicrophone, toggleVideo}: MediaControlsProps
) => {

    return (
        <div className={styles.mediaControls}>
            <button type="button" onClick={toggleMicrophone}>
                <svg viewBox="0 0 32 32" aria-hidden="true">
                    <rect x="12" y="3" width="8" height="18" rx="4" />
                    <path d="M7 15v2a9 9 0 0 0 18 0v-2M16 26v4M11 30h10" />
                </svg>
                Microphone
            </button>
            <button type="button" onClick={toggleVideo}>
                <svg viewBox="0 0 32 32" aria-hidden="true">
                    <rect x="2" y="7" width="21" height="19" rx="2" />
                    <path d="m23 13 7-5v17l-7-5" />
                </svg>
                Camera
            </button>
        </div>
    )

}