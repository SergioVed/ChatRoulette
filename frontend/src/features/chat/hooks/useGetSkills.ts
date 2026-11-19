import {useState} from "react";
import type {UserSkill} from "../types.ts";
import {API_BASE_URL} from "../../../shared/api/http.ts";
import {useUserContext} from "../../shared/hooks/useUserContext.ts";

export function useGetSkills () {
    const {token} = useUserContext()
    const [skills, setSkills] = useState<UserSkill[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    async function getSkills () {
        setError(null)
        setLoading(true)

        try {
            const response = await fetch(`${API_BASE_URL}/user-skills`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            })

            if (!response.ok) {
                throw new Error('Failed to fetch user skills.')
            }

            const data: UserSkill[] = await response.json()
            setSkills(data)
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message)
            } else {
                setError('Unknown error')
            }
        } finally {
            setLoading(false)
        }
    }

    return {skills, loading, error, getSkills}
}
