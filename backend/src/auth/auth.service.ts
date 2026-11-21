import {ConflictException, Injectable, NotFoundException, OnModuleInit, UnauthorizedException} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { argon2id, hash, verify } from 'argon2';
import { randomBytes } from 'node:crypto';
import { QueryFailedError } from 'typeorm';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import {isUUID} from "class-validator";
import {AuthenticatedUser} from "../chat/types";

const hashingOptions = { type: argon2id, memoryCost: 65536, timeCost: 3, parallelism: 1 } as const;

@Injectable()
export class AuthService implements OnModuleInit {
  private dummyHash!: string;

  constructor(private readonly users: UsersService, private readonly jwt: JwtService) {}

  async onModuleInit(): Promise<void> {
    this.dummyHash = await hash(randomBytes(32), hashingOptions);
  }

  async login(dto: LoginDto): Promise<{ accessToken: string }> {
    const user = await this.users.findByEmail(dto.email);
    const matches = await verify(user?.passwordHash ?? this.dummyHash, dto.password);

    if (!user?.passwordHash || !matches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.createToken(user.id);
  }

  async register(dto: RegisterDto): Promise<{ accessToken: string; onboardingCompleted: boolean }> {
    const email = dto.email.trim().toLowerCase();
    if (await this.users.findByEmail(email)) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await hash(dto.password, hashingOptions);

    let user;
    try {
      user = await this.users.create(dto.name.trim(), email, passwordHash);
    } catch (error) {
      if (error instanceof QueryFailedError && error.driverError.code === '23505') {
        throw new ConflictException('Email is already registered');
      }
      throw error;
    }
    const token = await this.createToken(user.id);
    return {
      ...token,
      onboardingCompleted: user.onboardingCompleted
    };
  }

  async authMe(userId: string) {
    const user = await this.users.getOne(userId);

    if (!user) {
      throw new NotFoundException('User not found')
    }

    return {
      id: user.id,
      onBoardingCompleted: user.onboardingCompleted
    }
  }

  private async createToken(userId: string): Promise<{ accessToken: string }> {
    const token = await this.jwt.signAsync({ sub: userId })
    return { accessToken: token };
  }

  public async verifyToken (accessToken: string): Promise<AuthenticatedUser> {
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string, exp: number }>(
          accessToken,
          { algorithms: ['HS256'] },
      )

      if (typeof payload.sub !== 'string' || !isUUID(payload.sub)){
        throw new UnauthorizedException()
      }

      return {
        userId: payload.sub,
        exp: payload.exp
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired access token')
    }
  }
}
