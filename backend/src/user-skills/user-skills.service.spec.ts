import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, QueryFailedError } from 'typeorm';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { SkillsService } from '../skills/skills.service';
import { UsersService } from '../users/users.service';
import { UserSkillRole, type Skill } from './types';
import { UserSkill } from './user-skill.entity';
import { UserSkillsService } from './user-skills.service';

describe('UserSkillsService.create', () => {
  let module: TestingModule;
  let service: UserSkillsService;
  const userId = '550e8400-e29b-41d4-a716-446655440000';
  const updatedUser = {
    id: userId,
    name: 'Test',
    email: 'test@example.com',
    passwordHash: null,
    onboardingCompleted: true,
  };
  const selections: Skill[] = [
    { skillId: '550e8400-e29b-41d4-a716-446655440001', role: UserSkillRole.STUDENT },
    { skillId: '550e8400-e29b-41d4-a716-446655440002', role: UserSkillRole.STUDENT },
  ];
  const dto = { skills: selections.slice(0, 1) };
  type Assignment = { userId: string; skillId: string; role: UserSkillRole };
  const manager = {
    existsBy: jest.fn<() => Promise<boolean>>(),
    create: jest.fn((_entity: typeof UserSkill, fields: Assignment) => fields),
    save: jest.fn(async (_entity: typeof UserSkill, assignment: Assignment) => assignment),
  };
  const skills = { findOne: jest.fn<() => Promise<unknown>>() };
  const users = { completeOnBoarding: jest.fn<UsersService['completeOnBoarding']>() };
  const dataSource = {
    transaction: (run: (transactionManager: typeof manager) => Promise<unknown>) => run(manager),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    skills.findOne.mockResolvedValue({ id: dto.skills[0].skillId });
    manager.existsBy.mockResolvedValue(false);
    manager.save.mockImplementation(async (_entity, assignment) => assignment);
    users.completeOnBoarding.mockResolvedValue(updatedUser);

    module = await Test.createTestingModule({
      providers: [
        UserSkillsService,
        { provide: getRepositoryToken(UserSkill), useValue: {} },
        { provide: DataSource, useValue: dataSource },
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
    const result = await service.create(userId, { skills: selections });

    expect(result).toEqual({
      updatedUser,
      addedSkills: selections.map((selection) => ({ userId, ...selection })),
    });
    expect(users.completeOnBoarding.mock.calls).toEqual([[userId, manager]]);
    expect(users.completeOnBoarding.mock.invocationCallOrder[0])
      .toBeGreaterThan(manager.save.mock.invocationCallOrder[1]);
  });

  it('rejects empty input without changing onboarding', async () => {
    await expect(service.create(userId, { skills: [] })).rejects.toBeInstanceOf(ForbiddenException);
    expect(manager.save).not.toHaveBeenCalled();
    expect(users.completeOnBoarding).not.toHaveBeenCalled();
  });

  it('preserves a missing-skill error without saving', async () => {
    const error = new NotFoundException('Skill not found');
    skills.findOne.mockRejectedValue(error);

    await expect(service.create(userId, dto)).rejects.toBe(error);
    expect(manager.save).not.toHaveBeenCalled();
    expect(users.completeOnBoarding).not.toHaveBeenCalled();
  });

  it('rejects an existing assignment without changing onboarding', async () => {
    manager.existsBy.mockResolvedValue(true);

    await expect(service.create(userId, dto)).rejects.toBeInstanceOf(ConflictException);
    expect(manager.save).not.toHaveBeenCalled();
    expect(users.completeOnBoarding).not.toHaveBeenCalled();
  });

  it('translates a concurrent unique violation to a conflict', async () => {
    manager.save.mockRejectedValue(new QueryFailedError('INSERT', [],
      Object.assign(new Error('duplicate'), { code: '23505' })));

    await expect(service.create(userId, dto)).rejects.toBeInstanceOf(ConflictException);
    expect(users.completeOnBoarding).not.toHaveBeenCalled();
  });

  it.each(['lookup', 'save', 'onboarding'] as const)('propagates %s database failures', async (stage) => {
    const error = new Error('database unavailable');
    if (stage === 'lookup') manager.existsBy.mockRejectedValue(error);
    if (stage === 'save') manager.save.mockRejectedValue(error);
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
