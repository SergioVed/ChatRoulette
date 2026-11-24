import styles from './ControlButtons.module.css'

interface EndCallButtonProps {
  onClick?: () => void
  disabled?: boolean
  label?: string
}

export const EndCallButton = ({ onClick, disabled, label = 'End call' }: EndCallButtonProps) => (
  <button
    type="button"
    className={`${styles.button} ${styles.actionButton} ${styles.endCall}`}
    onClick={onClick}
    disabled={disabled}
  >
    {label}
  </button>
)
