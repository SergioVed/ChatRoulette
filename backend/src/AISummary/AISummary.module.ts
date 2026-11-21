import { Module } from '@nestjs/common';
import { AISummaryController } from './AISummary.controller';
import { AISummaryService } from './AISummary.service';

@Module({
  controllers: [AISummaryController],
  providers: [AISummaryService]
})
export class AISummaryModule {}
