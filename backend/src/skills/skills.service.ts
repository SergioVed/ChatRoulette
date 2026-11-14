import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Skill } from './skill.entity';

@Injectable()
export class SkillsService {
  constructor(@InjectRepository(Skill) private readonly skills: Repository<Skill>) {}

  findAll(): Promise<Skill[]> {
    return this.skills.find({ select: { id: true, name: true }});
  }

  async findOne(id: string): Promise<Skill> {
    const skill = await this.skills.findOne({ where: { id }, select: { id: true, name: true } });
    if (!skill) {
      throw new NotFoundException('Skill not found');
    }
    return skill;
  }
}
