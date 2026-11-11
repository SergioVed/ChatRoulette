export interface LoginInput {
    email: string
    password: string
}

export interface RegistrationInput {
    name: string
    email: string
    password: string
}

export interface AuthResponse {
    accessToken: string
}