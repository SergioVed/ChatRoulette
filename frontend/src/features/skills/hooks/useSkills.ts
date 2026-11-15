import { useContext, useState } from 'react'
import type { SelectedSkill, Skill } from '../types.ts'
import { apiGetSkills, saveSkills as apiSaveSkills } from '../api/apiGetSkills.ts'
import { UserContext } from '../../../shared/context/userContext.tsx'

export function useSkills() {
  const { token } = useContext(UserContext)!
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [skills, setSkills] = useState<Skill[]>([])

  async function getSkills() {
    setLoading(true)
    setError(null)

    try {
      const data = await apiGetSkills()
      setSkills(data)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load skills. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function saveSkills(selectedSkills: SelectedSkill[]) {
    setLoading(true)
    setError(null)

    try {
      if (!token) throw new Error('Please log in to save skills.')
      await apiSaveSkills(selectedSkills, token)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save skills. Please try again.')
      throw error
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, skills, getSkills, saveSkills }
}
