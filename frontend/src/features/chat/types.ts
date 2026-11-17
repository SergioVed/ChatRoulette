

export type UserRole = 'teacher' | 'student'

export interface Skill {
    id: string,
    name: string,
    icon: string
}

export interface UserSkill {
    userId: string,
    skillId: string,
    role: UserRole,
    skill: Skill
}
