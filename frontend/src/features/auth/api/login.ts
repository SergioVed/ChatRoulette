import type { AuthResponse } from '../types.ts'
import type {LoginInput} from "../types.ts";
import {apiRequest} from "../../../shared/api/http.ts";

export function login(input: LoginInput): Promise<AuthResponse> {
  return apiRequest('auth/login', {
    body: JSON.stringify(input),
    method: 'POST',
  })
}
