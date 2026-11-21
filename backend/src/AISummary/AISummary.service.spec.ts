import { Test, TestingModule } from '@nestjs/testing';
import { AISummaryService } from './AISummary.service';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';


describe('AISummaryService', () => {
  let service: AISummaryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AISummaryService],
    }).compile();

    service = module.get<AISummaryService>(AISummaryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
