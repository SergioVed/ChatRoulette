import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, type EntityManager } from 'typeorm';
import { User } from './user.entity';
import {create} from "node:domain";

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly users: Repository<User>) {}

  findByEmail(email: string): Promise<User | null> {
    const normalized_email = email.trim().toLowerCase();

    return this.users.findOne({
      where: { email: normalized_email },
      select: {
        id: true,
        name: true,
        email: true,
        passwordHash: true,
      }
    })
  }

  create(name: string, email: string, passwordHash: string): Promise<User> {
    return this.users.save(this.users.create({ name, email, passwordHash }));
  }

  async getOne(id: string, manager?: EntityManager): Promise<User | null> {
    const users = manager?.getRepository(User) ?? this.users;
    return users.findOne({ where: { id } });
  }

  async completeOnBoarding(id: string, manager?: EntityManager): Promise<User> {
    const users = manager?.getRepository(User) ?? this.users;
    await users.update({ id }, { onboardingCompleted: true });

    const user = await this.getOne(id, manager);
    if (!user) throw new NotFoundException('User not found');

    return user;
  }
}
