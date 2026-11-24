import {type ReactNode, useEffect, useState} from "react";
import {UserContext, type UserData} from "./userContext.tsx";
import {authMe} from "../../features/auth/api/authMe.ts";


interface UserProviderProps {
    children: ReactNode
}

export const UserProvider= ({children} : UserProviderProps) => {
    const [token, setToken] = useState<string | null>(() => {
        return localStorage.getItem("token")
    });

    const [user, setUser] = useState<UserData | null>(null)

    useEffect(() => {
        if (!token) {
            setUser(null);
            return;
        }

        async function getMe(accessToken: string) {
            try {
                const response = await authMe(accessToken);
                setUser(response);
            } catch (error) {
                localStorage.removeItem('token')
                setToken(null)
                setUser(null)
            }
        }

        void getMe(token)
    }, [token])

    return (
        <UserContext.Provider
            value={{
                token,
                setToken,
                user,
                setUser
            }}
        >
            {children}
        </UserContext.Provider>
    );
}
