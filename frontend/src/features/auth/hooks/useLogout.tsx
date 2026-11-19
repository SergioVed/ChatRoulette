import {useUserContext} from "../../shared/hooks/useUserContext.ts";


export const useLogout = () => {

    const {setToken} = useUserContext()

    function logout () {
        localStorage.removeItem('token');
        setToken(null)
    }

    return {logout}
}