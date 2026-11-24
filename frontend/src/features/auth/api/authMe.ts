import { API_BASE_URL } from '../../../shared/api/http.ts'

export interface AuthMeResponse {
  id: string
  onBoardingCompleted: boolean,
  name: string
}

export async function authMe(token: string): Promise<AuthMeResponse> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}/auth/auth-me`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
  } catch {
    throw new Error('Unable to connect. Please check your connection and try again.')
  }

  if (!response.ok) throw new Error(`Failed to load your account: ${response.status}`)

  const data = await response.json().catch(() => null)
  if (typeof data?.userId !== 'string' || typeof data?.onBoardingCompleted !== 'boolean') {
    throw new Error('Unexpected response from the server. Please try again.')
  }

  return {
    id: data.userId,
    onBoardingCompleted: data.onBoardingCompleted,
    name: data.name
  }
}
