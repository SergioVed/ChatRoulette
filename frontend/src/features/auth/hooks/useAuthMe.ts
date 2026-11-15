import { useContext, useState } from 'react'
import { authMe as apiAuthMe, type AuthMeResponse } from '../api/authMe.ts'
import { UserContext } from '../../../shared/context/userContext.tsx'

export function useAuthMe() {
  const token = useContext(UserContext)?.token
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<AuthMeResponse | null>(null)

  async function authMe(): Promise<AuthMeResponse | null> {
    setError(null)
    setLoading(true)

    try {
      if (!token) throw new Error('Please log in to load your account.')
      const data = await apiAuthMe(token)
      setUser(data)
      return data
    } catch (error) {
      setUser(null)
      setError(error instanceof Error ? error.message : 'Failed to load your account. Please try again.')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { id: user?.id ?? null, completedOnboarding: user?.completedOnboarding ?? null, loading, error, authMe }
}
