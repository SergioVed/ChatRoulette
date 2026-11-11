import { authRequest } from './authRequest.ts'
import type { AuthResponse } from '../types.ts'
import type {LoginInput} from "../types.ts";

export function login(input: LoginInput): Promise<AuthResponse> {
  return authRequest('login', {
    ...input,
    email: input.email.trim().toLowerCase(),
  }, 'Login is unavailable right now. Please try again.', {
    401: 'Invalid email or password.',
  })
}
