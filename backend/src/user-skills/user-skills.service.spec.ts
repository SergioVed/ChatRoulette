import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QueryFailedError } from 'typeorm';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SkillsService } from '../skills/skills.service';
import { UsersService } from '../users/users.service';
import { UserSkillRole } from './types';
import { UserSkill } from './user-skill.entity';
import { UserSkillsService } from './user-skills.service';

describe('UserSkillsService.create', () => {
  let module: TestingModule;
  let service: UserSkillsService;
  const userId = '550e8400-e29b-41d4-a716-446655440000';
  const dto = { skillIds: ['550e8400-e29b-41d4-a716-446655440001'], role: UserSkillRole.STUDENT };
  const repository = {
    existsBy: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
  };
  const skills = { findOne: vi.fn() };
  const users = { completeOnBoarding: vi.fn() };

  beforeEach(async () => {
    vi.resetAllMocks();
    skills.findOne.mockResolvedValue({ id: dto.skillIds[0] });
    repository.existsBy.mockResolvedValue(false);
    repository.create.mockImplementation((fields) => fields);
    repository.save.mockImplementation(async (assignment) => assignment);
    users.completeOnBoarding.mockResolvedValue({ id: userId, onboardingCompleted: true });

    module = await Test.createTestingModule({
      providers: [
        UserSkillsService,
        { provide: getRepositoryToken(UserSkill), useValue: repository },
        { provide: SkillsService, useValue: skills },
        { provide: UsersService, useValue: users },
      ],
    }).compile();
    service = module.get(UserSkillsService);
  });

  afterEach(async () => {
    await module?.close();
  });

  it('saves each assignment and returns the completed user', async () => {
    const skillIds = [...dto.skillIds, '550e8400-e29b-41d4-a716-446655440002'];
    const result = await service.create(userId, { ...dto, skillIds });

    expect(result).toEqual({
      updatedUser: { id: userId, onboardingCompleted: true },
      addedSkills: skillIds.map((skillId) => ({ userId, skillId, role: dto.role })),
    });
    expect(users.completeOnBoarding).toHaveBeenCalledExactlyOnceWith(userId);
    expect(users.completeOnBoarding.mock.invocationCallOrder[0])
      .toBeGreaterThan(repository.save.mock.invocationCallOrder[1]);
  });

  it('rejects empty input without changing onboarding', async () => {
    await expect(service.create(userId, { ...dto, skillIds: [] })).rejects.toBeInstanceOf(ForbiddenException);
    expect(repository.save).not.toHaveBeenCalled();
    expect(users.completeOnBoarding).not.toHaveBeenCalled();
  });

  it('preserves a missing-skill error without saving', async () => {
    const error = new NotFoundException('Skill not found');
    skills.findOne.mockRejectedValue(error);

    await expect(service.create(userId, dto)).rejects.toBe(error);
    expect(repository.save).not.toHaveBeenCalled();
    expect(users.completeOnBoarding).not.toHaveBeenCalled();
  });

  it('rejects an existing assignment without changing onboarding', async () => {
    repository.existsBy.mockResolvedValue(true);

    await expect(service.create(userId, dto)).rejects.toBeInstanceOf(ConflictException);
    expect(repository.save).not.toHaveBeenCalled();
    expect(users.completeOnBoarding).not.toHaveBeenCalled();
  });

  it('translates a concurrent unique violation to a conflict', async () => {
    repository.save.mockRejectedValue(new QueryFailedError('INSERT', [],
      Object.assign(new Error('duplicate'), { code: '23505' })));

    await expect(service.create(userId, dto)).rejects.toBeInstanceOf(ConflictException);
    expect(users.completeOnBoarding).not.toHaveBeenCalled();
  });

  it.each(['lookup', 'save', 'onboarding'] as const)('propagates %s database failures', async (stage) => {
    const error = new Error('database unavailable');
    if (stage === 'lookup') repository.existsBy.mockRejectedValue(error);
    if (stage === 'save') repository.save.mockRejectedValue(error);
    if (stage === 'onboarding') users.completeOnBoarding.mockRejectedValue(error);

    await expect(service.create(userId, dto)).rejects.toBe(error);
    if (stage !== 'onboarding') expect(users.completeOnBoarding).not.toHaveBeenCalled();
  });

  it('preserves a missing-user error from onboarding completion', async () => {
    const error = new NotFoundException('User not found');
    users.completeOnBoarding.mockRejectedValue(error);

    await expect(service.create(userId, dto)).rejects.toBe(error);
  });
});
