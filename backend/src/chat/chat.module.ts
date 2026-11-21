import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import {ChatGateway} from "./chat-gateway";
import {UserSkillsModule} from "../user-skills/user-skills.module";
import {AuthModule} from "../auth/auth.module";

@Module({
  imports: [
      UserSkillsModule,
      AuthModule
  ],
  controllers: [],
  providers: [ChatService, ChatGateway]
})
export class ChatModule {}
