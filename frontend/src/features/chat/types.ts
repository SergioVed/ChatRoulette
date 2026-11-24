

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

export interface Partner {
    name: string,
    skill: string
}

export enum ConversationState {
    IDLE="idle",
    SEARCHING="searching",
    MATCHED="matched"
}