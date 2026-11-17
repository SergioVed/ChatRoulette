import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {User} from "./user.entity";
import { Skill } from '../skills/skill.entity';
import { UserSkill } from '../user-skills/user-skill.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Skill, UserSkill])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}
