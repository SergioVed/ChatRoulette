import { type SelectedSkill, type Skill } from '../types.ts'
import {apiRequest} from '../../../shared/api/http.ts'


export async function apiGetSkills(): Promise<Skill[]> {
    const data = await apiRequest("skills", {
        method: 'GET',
    })

    return data
}

export async function saveSkills(selectedSkills: SelectedSkill[], token: string): Promise<void> {
    if (selectedSkills.length === 0) throw new Error('Select at least one skill.')

    const skills = selectedSkills.map(s => {
        return {
            skillId: s.id,
            role: s.role
        }
    })

    const data = await apiRequest("user-skills", {
        method: 'POST',
        body: JSON.stringify({skills}),
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    return data
}
