import styles from './SkillsForm.module.css'
import { SkillItem } from './SkillItem.tsx'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSkills } from '../hooks/useSkills.ts'
import { useDebounce } from '../../shared/hooks/useDebounce.ts'
import {type SelectedSkill, SkillRole} from "../types.ts";

export const SkillsForm = () => {

  const { skills, loading, error, getSkills, saveSkills } = useSkills()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [selectedSkills, setSelectedSkills] = useState<SelectedSkill[]>([])
  const debouncedValue = useDebounce(name, 1000)

  useEffect(() => {
    void getSkills()
  }, [])

  async function handleContinue() {
    if (loading || selectedSkills.length === 0) return

    try {
      await saveSkills(selectedSkills)
      await navigate('/', { replace: true })
    } catch {
      // useSkills exposes the save error for the form to display.
    }
  }

  const toggleSkill = (id: string) => {
    setSelectedSkills((previous) => previous.find((skill) => skill.id === id)
      ? previous.filter((skill) => skill.id !== id)
      : [...previous, { id, role: SkillRole.STUDENT }])
  }

  const changeSkillRole = (id: string, role: SkillRole) => {
    setSelectedSkills((previous) => previous.map((skill) =>
      skill.id === id ? { ...skill, role } : skill))
  }

  const query = debouncedValue.trim().toLowerCase()
  const visibleSkills = skills.filter((skill) => skill.name.toLowerCase().includes(query))

  return (
  <div className={styles.page}>
    <header className={styles.header}>
      <p className={styles.brand}>TeacherStudent</p>
      <div className={styles.progress}>
        <span>Step 2 of 2</span>
        <span className={styles.progressTrack} aria-hidden="true"><span/></span>
      </div>
    </header>
    <main className={styles.card}>
      <h1 className={styles.heading}>Set up your skills</h1>
      <p className={styles.description}>
        Choose the skills you can teach or want to learn. You can always update them later.
      </p>
      <div className={styles.search}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="10.5" cy="10.5" r="7.5"/>
          <path d="m16 16 5 5"/>
        </svg>
        <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            type="search"
            aria-label="Search skills"
            placeholder="Search skills..."/>
      </div>
      <ul className={styles.grid} aria-label="Available skills" aria-busy={loading} tabIndex={0}>
        {loading ? (
          <li className={styles.message} role="status">Loading skills…</li>
        ) : error ? (
          <li className={styles.message}>
            <p role="alert">{error}</p>
            <button type="button" className={styles.retry} onClick={() => void getSkills()}>Try again</button>
          </li>
        ) : visibleSkills.length === 0 ? (
          <li className={styles.message} role="status">
            {skills.length === 0 ? 'No skills are available yet.' : 'No skills match your search.'}
          </li>
        ) : visibleSkills.map((skill) => {
          const selection = selectedSkills.find((selected) => selected.id === skill.id)
          return (
            <SkillItem key={skill.id} {...skill} selected={Boolean(selection)} role={selection?.role}
              onToggle={toggleSkill} onRoleChange={changeSkillRole} />
          )
        })}
      </ul>
      <footer className={styles.footer}>
        <p aria-live="polite">{selectedSkills.length} {selectedSkills.length === 1 ? 'skill' : 'skills'} selected</p>
        <button className={styles.continue} type="button"
          disabled={loading || selectedSkills.length === 0} onClick={() => void handleContinue()}>
          Continue
        </button>
      </footer>
    </main>
  </div>
  )}
