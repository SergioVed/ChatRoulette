import {IsArray, IsEnum, IsUUID} from 'class-validator';
import {UserSkillRole} from "../types";

export class CreateUserSkillDto {
  @IsArray()
  @IsUUID('4', { each: true })
  skillIds!: string[];

  @IsEnum(UserSkillRole)
  role!: UserSkillRole;
}
