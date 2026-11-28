import { beforeEach, describe, expect, it } from '@jest/globals';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AISummaryController } from './AISummary.controller';
import { AISummaryService } from './AISummary.service';


describe('AISummaryController', () => {
  let controller: AISummaryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AISummaryController],
      providers: [
        { provide: AISummaryService, useValue: {} },
        { provide: JwtService, useValue: {} },
      ],
    }).compile();

    controller = module.get<AISummaryController>(AISummaryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
