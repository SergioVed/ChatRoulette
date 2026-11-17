import {type ReactNode, useEffect, useState} from "react";
import {UserContext} from "./userContext.tsx";
import {authMe} from "../../features/auth/api/authMe.ts";


interface UserProviderProps {
    children: ReactNode
}

export const UserProvider= ({children} : UserProviderProps) => {
    const [token, setToken] = useState<string | null>(() => {
        return localStorage.getItem("token")
    });

    const [completedOnBoarding, setCompletedOnBoarding] = useState<boolean | null>(null)

    useEffect(() => {
        if (!token) {
            setCompletedOnBoarding(null);
            return;
        }

        async function getMe(accessToken: string) {
            try {
                const response = await authMe(accessToken);
                setCompletedOnBoarding(response.completedOnboarding);
            } catch (error) {
                console.error("Failed to fetch user:", error);
                setCompletedOnBoarding(null);
            }
        }

        void getMe(token)
    }, [token])

    return (
        <UserContext.Provider
            value={{
                token,
                setToken,
                completedOnBoarding,
                setCompletedOnBoarding,
            }}
        >
            {children}
        </UserContext.Provider>
    );
}
