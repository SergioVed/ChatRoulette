import { Module } from '@nestjs/common';
import { AISummaryController } from './AISummary.controller';
import { AISummaryService } from './AISummary.service';
import {AuthModule} from "../auth/auth.module";

@Module({
  imports: [
      AuthModule
  ],
  controllers: [AISummaryController],
  providers: [AISummaryService]
})
export class AISummaryModule {}
