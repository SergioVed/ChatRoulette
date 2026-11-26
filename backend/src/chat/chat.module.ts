import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import {ChatGateway} from "./chat-gateway";
import {UserSkillsModule} from "../user-skills/user-skills.module";
import {AuthModule} from "../auth/auth.module";
import { CallModule } from '../calls/call.module';

@Module({
  imports: [
      UserSkillsModule,
      AuthModule,
      CallModule,
  ],
  controllers: [],
  providers: [ChatService, ChatGateway]
})
export class ChatModule {}
