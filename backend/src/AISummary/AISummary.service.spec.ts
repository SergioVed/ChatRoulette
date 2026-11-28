import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CallService } from '../calls/call.service';
import { AISummaryService } from './AISummary.service';
import { Summary } from './summary.entity';


describe('AISummaryService', () => {
  let service: AISummaryService;

  beforeEach(async () => {
    jest.replaceProperty(process, 'env', { ...process.env, GROQ_API_KEY: 'unit-test-key' });
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AISummaryService,
        { provide: getRepositoryToken(Summary), useValue: {} },
        { provide: CallService, useValue: {} },
      ],
    }).compile();

    service = module.get<AISummaryService>(AISummaryService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
