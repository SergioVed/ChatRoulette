import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  getOne(id: string) {
    return this.users.findOne({
      where: {id}
    })
  }
}
