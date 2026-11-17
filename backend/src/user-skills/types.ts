import {User} from "../users/user.entity";
import {UserSkill} from "./user-skill.entity";

export enum UserSkillRole {
    TEACHER = 'teacher',
    STUDENT = 'student',
}

export interface CreateUserSkillsResponse {
    addedSkills: UserSkill[],
    updatedUser: User
}