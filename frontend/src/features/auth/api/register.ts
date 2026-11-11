import { authRequest } from './authRequest.ts'
import type { AuthResponse } from '../types.ts'
import type {RegistrationInput} from "../types.ts";

export type RegistrationResponse = AuthResponse

export function register(input: RegistrationInput): Promise<RegistrationResponse> {
  return authRequest('register', {
    ...input,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
  }, 'Registration is unavailable right now. Please try again.', {
    409: 'Email is already registered. Please log in or use another email.',
  })
}
