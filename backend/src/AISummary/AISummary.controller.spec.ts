import { Test, TestingModule } from '@nestjs/testing';
import { AISummaryController } from './AISummary.controller';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';


describe('AISummaryController', () => {
  let controller: AISummaryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AISummaryController],
    }).compile();

    controller = module.get<AISummaryController>(AISummaryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
