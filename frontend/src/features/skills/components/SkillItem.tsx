import styles from './SkillItem.module.css'
import { SkillRole } from '../types.ts'

export interface SkillItemProps {
  selected: boolean,
  onToggle: (id: string) => void,
  onRoleChange: (id: string, role: SkillRole) => void,
  id: string,
  name: string
  role?: SkillRole
  icon?: string | null
}

export function SkillItem({ name, role = SkillRole.STUDENT, icon, onToggle, onRoleChange, id, selected }: SkillItemProps) {

  return (
    <li className={`${styles.item} ${selected ? styles.selected : ''}`}>
      <label className={styles.label}>
        <input type="checkbox" checked={selected} onChange={() => onToggle(id)} aria-label={`Select ${name}`} />
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d={icon ?? undefined} />
        </svg>
        <span>{name}</span>
      </label>
      {selected && (
        <div className={styles.roles} role="group" aria-label={`Role for ${name}`}>
          <button type="button" aria-pressed={role === SkillRole.TEACHER}
            onClick={() => onRoleChange(id, SkillRole.TEACHER)}>Teach</button>
          <button type="button" aria-pressed={role === SkillRole.STUDENT}
            onClick={() => onRoleChange(id, SkillRole.STUDENT)}>Learn</button>
        </div>
      )}
    </li>
  )
}
