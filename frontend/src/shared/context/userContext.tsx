import {createContext} from "react";


interface UserContextType {
    token: string | null
    setToken: (token: string | null) => void
}

export const UserContext = createContext<UserContextType | null>(null)