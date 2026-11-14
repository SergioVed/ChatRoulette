import type {Skill} from "../types.ts";
import {API_BASE_URL} from "../../../shared/api/http.ts";


export async function apiGetSkills (): Promise<Skill[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/skills`, {
            method: "GET",
        })

        if (!response.ok) {
            throw new Error(`Failed to fetch skills: ${response.status}`);
        }

        const data: Skill[] = await response.json();

        return data;
    } catch (error) {

    }
}
