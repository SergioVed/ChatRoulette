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

  async findOne(id: string, manager?: EntityManager): Promise<Skill | null> {
    const skills = manager?.getRepository(Skill) ?? this.skills;
    return await skills.findOne({ where: { id } });
  }
}
