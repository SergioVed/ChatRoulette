

export type Skill = {
    name: string,
    id: string,
    icon?: string | null
}

export type SelectedSkill = {
    id: string,
    role: SkillRole
}

export enum SkillRole {
    TEACHER = 'teacher',
    STUDENT = 'student',
}