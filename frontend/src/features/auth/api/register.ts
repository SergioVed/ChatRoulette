import type { AuthResponse } from '../types.ts'
import type {RegistrationInput} from "../types.ts";
import {apiRequest} from "../../../shared/api/http.ts";

export interface RegistrationResponse extends AuthResponse {
  onboardingCompleted: boolean
}

export async function register(input: RegistrationInput): Promise<RegistrationResponse> {
  const response = await apiRequest('auth/register', {
    body: JSON.stringify(input),
    method: 'POST',
  })

  return {
    accessToken: response.accessToken,
    onboardingCompleted: response.onboardingCompleted
  }
}
