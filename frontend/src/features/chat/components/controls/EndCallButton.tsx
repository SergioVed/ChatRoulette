import styles from './ControlButtons.module.css'

interface EndCallButtonProps {
  onClick?: () => void
  disabled?: boolean
}

export const EndCallButton = ({ onClick, disabled }: EndCallButtonProps) => (
  <button
    type="button"
    className={`${styles.button} ${styles.actionButton} ${styles.endCall}`}
    onClick={onClick}
    disabled={disabled}
  >
    End call
  </button>
)
