import { Module } from '@nestjs/common';
import { UserMatchingService } from './user-matching.service';
import {UserMatchingGateway} from "./user-matching-gateway";
import {UserSkillsModule} from "../user-skills/user-skills.module";
import {AuthModule} from "../auth/auth.module";

@Module({
  imports: [
      UserSkillsModule,
      AuthModule
  ],
  controllers: [],
  providers: [UserMatchingService, UserMatchingGateway]
})
export class UserMatchingModule {}
