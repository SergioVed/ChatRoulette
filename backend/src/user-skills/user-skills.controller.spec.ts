import { Test, TestingModule } from '@nestjs/testing';
import { UserSkillsController } from './user-skills.controller';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('UserSkillsController', () => {
  let controller: UserSkillsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserSkillsController],
    }).compile();

    controller = module.get<UserSkillsController>(UserSkillsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
