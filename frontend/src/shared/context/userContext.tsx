import {createContext, type SetStateAction} from "react";
import * as React from "react";

export interface UserData {
    name: string,
    onBoardingCompleted: boolean
}

interface UserContextType {
    token: string | null
    setToken: (token: string | null) => void
    user: UserData | null
    setUser: React.Dispatch<SetStateAction<UserData>>
}

export const UserContext = createContext<UserContextType | null>(null)