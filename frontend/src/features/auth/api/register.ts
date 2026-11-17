import { authRequest } from './authRequest.ts'
import type { AuthResponse } from '../types.ts'
import type {RegistrationInput} from "../types.ts";

export interface RegistrationResponse extends AuthResponse {
  onboardingCompleted: boolean
}

export async function register(input: RegistrationInput): Promise<RegistrationResponse> {
  const response = await authRequest('register', {
    ...input,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
  }, 'Registration is unavailable right now. Please try again.', {
    409: 'Email is already registered. Please log in or use another email.',
  })
  if (typeof response.onboardingCompleted !== 'boolean') {
    throw new Error('Unexpected response from the server. Please try again.')
  }
  return {
    accessToken: response.accessToken,
    onboardingCompleted: response.onboardingCompleted
  }
}
