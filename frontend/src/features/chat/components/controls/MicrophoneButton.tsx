import styles from './ControlButtons.module.css'

interface MicrophoneButtonProps {
  muted: boolean
  onClick?: () => void
  disabled?: boolean
}

export const MicrophoneButton = ({ muted, onClick, disabled }: MicrophoneButtonProps) => (
  <button
    type="button"
    className={`${styles.button} ${styles.mediaButton}${muted ? ` ${styles.mediaOff}` : ''}`}
    aria-pressed={!muted}
    title={muted ? 'Microphone muted' : 'Microphone on'}
    onClick={onClick}
    disabled={disabled}
  >
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <rect x="12" y="3" width="8" height="18" rx="4" />
        <path d="M7 15v2a9 9 0 0 0 18 0v-2M16 26v4M11 30h10" />
      {muted && <path d="M3 3 29 29" />}
    </svg>
    Microphone
  </button>
)
