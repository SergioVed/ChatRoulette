import styles from './ControlButtons.module.css'

interface CameraButtonProps {
  enabled: boolean
  onClick?: () => void
  disabled?: boolean
}

export const CameraButton = ({ enabled, onClick, disabled }: CameraButtonProps) => (
  <button
    type="button"
    className={`${styles.button} ${styles.mediaButton}${!enabled ? ` ${styles.mediaOff}` : ''}`}
    aria-pressed={enabled}
    title={!enabled ? 'Camera off' : 'Camera on'}
    onClick={onClick}
    disabled={disabled}
  >
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <rect x="2" y="7" width="21" height="19" rx="2" />
        <path d="m23 13 7-5v17l-7-5" />
      {!enabled && <path d="M3 3 29 29" />}
    </svg>
    Camera
  </button>
)
