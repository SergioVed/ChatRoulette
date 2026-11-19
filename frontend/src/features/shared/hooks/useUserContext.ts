import {useContext} from "react";
import {UserContext} from "../../../shared/context/userContext.tsx";


export const useUserContext = () => {
    const context = useContext(UserContext)

    if (!context) {
        throw new Error('Context is not defined')
    }

    return context
}