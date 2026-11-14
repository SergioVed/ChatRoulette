import {ConflictException, ForbiddenException, Injectable, NotFoundException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { SkillsService } from '../skills/skills.service';
import { CreateUserSkillDto } from './dto/create-user-skill.dto';
import { UpdateUserSkillDto } from './dto/update-user-skill.dto';
import { UserSkill } from './user-skill.entity';
import {async} from "rxjs";
import {Skill} from "../skills/skill.entity";

@Injectable()
export class UserSkillsService {
  constructor(
    @InjectRepository(UserSkill) private readonly assignments: Repository<UserSkill>,
    private readonly skills: SkillsService,
  ) {}

  async create(userId: string, dto: CreateUserSkillDto): Promise<UserSkill[]> {

    if (dto.skillIds.length === 0) {
      throw new ForbiddenException("Skills should not be empty")
    }

    const addedSkills = []

    for (const skillId of dto.skillIds) {
      await this.skills.findOne(skillId);
      const where = { userId, skillId: skillId };

      const exists = await this.assignments.existsBy(where)

      if (exists) {
        throw new ConflictException('Skill is already assigned');
      }

      try {
        const assignment = this.assignments.create({
          ...where,
          role: dto.role,
        });

        const saved = await this.assignments.save(assignment);

        addedSkills.push(saved);
      } catch (error) {
        if (error instanceof QueryFailedError && error.driverError.code === '23505') {
          throw new ConflictException('Skill is already assigned');
        }

        throw error;
      }
    }

    return addedSkills;
  }

  findAll(userId: string): Promise<UserSkill[]> {
    return this.assignments.find({
      where: { userId }, relations: { skill: true }
    });
  }

  async findOne(userId: string, skillId: string): Promise<UserSkill> {
    const assignment = await this.assignments.findOne({
      where: { userId, skillId }, relations: { skill: true },
    });

    if (!assignment){
      throw new NotFoundException('Skill assignment not found');
    }

    return assignment;
  }

  async update(userId: string, skillId: string, dto: UpdateUserSkillDto): Promise<UserSkill> {
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
