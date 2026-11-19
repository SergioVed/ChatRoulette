import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, type EntityManager } from 'typeorm';
import { Skill } from './skill.entity';

@Injectable()
export class SkillsService {
  constructor(@InjectRepository(Skill) private readonly skills: Repository<Skill>) {}

  findAll(): Promise<Skill[]> {
    return this.skills.find();
  }

  async findOne(id: string, manager?: EntityManager): Promise<Skill> {
    const skills = manager?.getRepository(Skill) ?? this.skills;
    const skill = await skills.findOne({ where: { id } });
    if (!skill) {
      throw new NotFoundException('Skill not found');
    }
    return skill;
  }
}
