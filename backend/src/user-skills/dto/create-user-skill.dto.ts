import {IsArray, IsEnum, IsUUID} from 'class-validator';
import {Skill} from "../types";

export class CreateUserSkillDto {
  @IsArray()
  skills!: Skill[]
}
