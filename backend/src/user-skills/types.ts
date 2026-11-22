import {User} from "../users/user.entity";
import {UserSkill} from "./user-skill.entity";
import {UUID} from "node:crypto";

export enum UserSkillRole {
    TEACHER = 'teacher',
    STUDENT = 'student',
}

export interface CreateUserSkillsResponse {
    addedSkills: UserSkill[],
    updatedUser: User
}

export interface Skill {
    skillId: UUID,
    role: UserSkillRole
}