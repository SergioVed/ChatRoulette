import { useRef, useState } from 'react'
import { register } from '../api/register.ts'
import type { RegistrationInput } from '../types.ts'

export function useRegistration() {
  const pending = useRef(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function submit(input: RegistrationInput) {
    if (pending.current) return

    pending.current = true
    setLoading(true)
    setError('')

    try {
      await register(input)
      setSuccess(true)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed. Please try again.')
    } finally {
      pending.current = false
      setLoading(false)
    }
  }

  return { loading, error, success, submit }
}
