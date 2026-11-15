import { SkillRole, type SelectedSkill, type Skill } from '../types.ts'
import { API_BASE_URL } from '../../../shared/api/http.ts'


export async function apiGetSkills(): Promise<Skill[]> {
    const response = await fetch(`${API_BASE_URL}/skills`)

    if (!response.ok) {
        throw new Error(`Failed to fetch skills: ${response.status}`)
    }

    const data: Skill[] = await response.json()
    return data
}

export async function saveSkills(selectedSkills: SelectedSkill[], token: string): Promise<void> {
    if (selectedSkills.length === 0) throw new Error('Select at least one skill.')

    for (const role of [SkillRole.TEACHER, SkillRole.STUDENT]) {
        const skillIds = selectedSkills.filter((skill) => skill.role === role).map((skill) => skill.id)
        if (skillIds.length === 0) continue

        const response = await fetch(`${API_BASE_URL}/user-skills`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ skillIds, role }),
        })
        if (!response.ok) throw new Error(`Failed to save skills: ${response.status}`)
    }
}
