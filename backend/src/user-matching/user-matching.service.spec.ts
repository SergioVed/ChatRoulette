import { Test, TestingModule } from '@nestjs/testing';
import { UserMatchingService } from './user-matching.service';
import { beforeEach, describe, it, expect } from '@jest/globals';

describe('UserMatchingService', () => {
  let service: UserMatchingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserMatchingService],
    }).compile();

    service = module.get<UserMatchingService>(UserMatchingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
