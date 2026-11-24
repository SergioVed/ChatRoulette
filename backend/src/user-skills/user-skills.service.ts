import {ConflictException, ForbiddenException, Injectable, NotFoundException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { SkillsService } from '../skills/skills.service';
import { CreateUserSkillDto } from './dto/create-user-skill.dto';
import { UpdateUserSkillDto } from './dto/update-user-skill.dto';
import { UserSkill } from './user-skill.entity';
import { UsersService } from '../users/users.service';
import type { CreateUserSkillsResponse } from './types';
import {DataSource} from "typeorm";

@Injectable()
export class UserSkillsService {
  constructor(
    @InjectRepository(UserSkill) private readonly assignments: Repository<UserSkill>,
    private readonly skills: SkillsService,
    private readonly users: UsersService,
    private readonly dataSource: DataSource
  ) {}

  async create(userId: string, dto: CreateUserSkillDto): Promise<CreateUserSkillsResponse> {
    if (dto.skills.length === 0) {
      throw new ForbiddenException('Skills should not be empty');
    }

    return await this.dataSource.transaction(async (manager) => {
      try {
        const addedSkills: UserSkill[] = [];

        for (const skill of dto.skills) {
          await this.skills.findOne(skill.skillId, manager);
          const where = {
            userId,
            skillId: skill.skillId
          };

          if (await manager.existsBy(UserSkill, where)) {
            throw new ConflictException('Skill is already assigned');
          }

          const assignment = manager.create(UserSkill, {
            ...where,
            role: skill.role,
          });

          const saved = await manager.save(UserSkill, assignment);

          addedSkills.push(saved);
        }

        const updatedUser = await this.users.completeOnBoarding(userId, manager);
        return { updatedUser, addedSkills };

      } catch (error) {
        if (error instanceof QueryFailedError && error.driverError?.code === '23505') {
          throw new ConflictException('Skill is already assigned');
        }

        throw error;
      }
    })
  }

  findAll(userId: string): Promise<UserSkill[]> {
    return this.assignments.find({
      where: { userId }, relations: { skill: true }
    });
  }

  async findOne(userId: string, skillId: string): Promise<UserSkill | null> {
    const assignment = await this.assignments.findOne({
      where: { userId, skillId }, relations: { skill: true, user: true },
    });

    if (!assignment){
      return null
    }

    return assignment;
  }

  async update(userId: string, skillId: string, dto: UpdateUserSkillDto): Promise<UserSkill | null> {
    if (dto.role !== undefined) {
      const result = await this.assignments.update({ userId, skillId }, { role: dto.role });
      if (!result.affected) {
        throw new NotFoundException('Skill assignment not found');
      }
    }

    return this.findOne(userId, skillId);
  }

  async remove(userId: string, skillId: string): Promise<void> {
    const result = await this.assignments.delete({ userId, skillId });
    if (!result.affected) throw new NotFoundException('Skill assignment not found');
  }
}
