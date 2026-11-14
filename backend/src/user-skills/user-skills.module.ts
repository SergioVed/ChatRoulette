import { Module } from '@nestjs/common';
import {TypeOrmModule} from "@nestjs/typeorm";
import { AuthModule } from '../auth/auth.module';
import { SkillsModule } from '../skills/skills.module';
import {UserSkill} from "./user-skill.entity";
import {UserSkillsController} from "./user-skills.controller";
import {UserSkillsService} from "./user-skills.service";

@Module({
    imports: [TypeOrmModule.forFeature([UserSkill]), AuthModule, SkillsModule],
    controllers: [UserSkillsController],
    providers: [UserSkillsService],
    exports: [UserSkillsService]
})
export class UserSkillsModule {}
