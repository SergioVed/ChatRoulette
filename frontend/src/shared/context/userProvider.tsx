import {type ReactNode, useState} from "react";
import {UserContext} from "./userContext.tsx";


interface UserProviderProps {
    children: ReactNode
}

export const UserProvider= ({children} : UserProviderProps) => {
    const [token, setToken] = useState<string | null>(() => {
        return localStorage.getItem("token")
    });

    return (
        <UserContext.Provider value={{ token, setToken }}>
            {children}
        </UserContext.Provider>
    );
}