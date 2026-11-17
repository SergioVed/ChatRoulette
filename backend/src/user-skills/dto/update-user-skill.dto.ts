import { IsEnum, ValidateIf } from 'class-validator';
import {UserSkillRole} from "../types";

export class UpdateUserSkillDto {
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsEnum(UserSkillRole)
  role?: UserSkillRole;
}
