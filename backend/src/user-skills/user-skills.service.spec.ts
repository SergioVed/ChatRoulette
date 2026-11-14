import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UserSkillsService } from './user-skills.service';
import {Test, TestingModule} from "@nestjs/testing";

describe('UserSkillsService', () => {
  let service: UserSkillsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserSkillsService],
    }).compile();

    service = module.get<UserSkillsService>(UserSkillsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
