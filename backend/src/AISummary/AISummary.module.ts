import { Module } from '@nestjs/common';
import { AISummaryController } from './AISummary.controller';
import { AISummaryService } from './AISummary.service';
import {AuthModule} from "../auth/auth.module";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Summary} from "./summary.entity";
import {SkillsModule} from "../skills/skills.module";

@Module({
  imports: [
      AuthModule,
      SkillsModule,
      TypeOrmModule.forFeature([Summary])
  ],
  controllers: [AISummaryController],
  providers: [AISummaryService]
})
export class AISummaryModule {}
