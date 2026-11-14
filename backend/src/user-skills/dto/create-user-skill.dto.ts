import { IsEnum, IsUUID } from 'class-validator';
import {UserSkillRole} from "../types";

export class CreateUserSkillDto {
  @IsUUID()
  skillId!: string;

  @IsEnum(UserSkillRole)
  role!: UserSkillRole;
}
