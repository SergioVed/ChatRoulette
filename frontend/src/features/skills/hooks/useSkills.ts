import { useState } from 'react'
import type { Skill } from '../types.ts'
import { apiGetSkills } from '../api/apiGetSkills.ts'

export function useSkills() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [skills, setSkills] = useState<Skill[]>([])

  async function getSkills() {
    try {
      setLoading(true)
      const data = await apiGetSkills()
      setSkills(data)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, skills, getSkills }
}
