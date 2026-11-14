import styles from './ControlButtons.module.css'

interface NextTeacherButtonProps {
  onClick?: () => void
  disabled?: boolean
}

export const NextTeacherButton = ({ onClick, disabled }: NextTeacherButtonProps) => (
  <button
    type="button"
    className={`${styles.button} ${styles.actionButton} ${styles.nextTeacher}`}
    onClick={onClick}
    disabled={disabled}
  >
    Next teacher
  </button>
)
