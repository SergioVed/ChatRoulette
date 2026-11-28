import { beforeEach, describe, expect, it } from '@jest/globals';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UserSkillsController } from './user-skills.controller';
import { UserSkillsService } from './user-skills.service';

describe('UserSkillsController', () => {
  let controller: UserSkillsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserSkillsController],
      providers: [
        { provide: UserSkillsService, useValue: {} },
        { provide: JwtService, useValue: {} },
      ],
    }).compile();

    controller = module.get<UserSkillsController>(UserSkillsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
