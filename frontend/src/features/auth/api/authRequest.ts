import { API_BASE_URL } from '../../../shared/api/http.ts'
import type {AuthResponse} from "../types.ts";

export async function authRequest(
  endpoint: string,
  input: object,
  fallbackMessage: string,
  statusMessages: Record<number, string>,
): Promise<AuthResponse & { onboardingCompleted?: boolean }> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}/auth/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
  } catch {
    throw new Error('Unable to connect. Please check your connection and try again.')
  }

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    if (statusMessages[response.status]) throw new Error(statusMessages[response.status])

    const message = data?.message

    if (response.status === 400) {
      const details = Array.isArray(message)
        ? message.filter((item: unknown) => typeof item === 'string').join(' ')
        : typeof message === 'string' ? message : ''
      if (details) throw new Error(details)
    }
    throw new Error(fallbackMessage)
  }
  if (typeof data?.accessToken !== 'string' || !data.accessToken) {
    throw new Error('Unexpected response from the server. Please try again.')
  }
  return {
    accessToken: data.accessToken,
    onboardingCompleted: data.onboardingCompleted
  }
}
