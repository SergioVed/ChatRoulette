import { useContext, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../../../shared/context/userContext.tsx'
import { register } from '../api/register.ts'
import type { RegistrationInput } from '../types.ts'

export function useRegistration() {
  const pending = useRef(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { setToken } = useContext(UserContext)!

  async function submit(input: RegistrationInput) {
    if (pending.current) return

    pending.current = true
    setLoading(true)
    setError('')

    try {
      const { accessToken, onboardingCompleted } = await register(input)
      try {
        localStorage.setItem('token', accessToken)
      } catch {
        throw new Error('Unable to save your session. Please enable browser storage and try again.')
      }
      setToken(accessToken)
      await navigate(onboardingCompleted === false ? '/setup-skills' : '/', { replace: true })
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed. Please try again.')
    } finally {
      pending.current = false
      setLoading(false)
    }
  }

  return { loading, error, submit }
}
