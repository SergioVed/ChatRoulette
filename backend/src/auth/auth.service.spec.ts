import { afterEach, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import {AuthService} from "./auth.service";
import {Test, TestingModule} from "@nestjs/testing";
import {TestModule} from "vitest/node";
import {UsersService} from "../users/users.service";
import {JwtService} from "@nestjs/jwt";
import {User} from "../users/user.entity";
import {ConflictException} from "@nestjs/common";

describe('AuthService', () => {

  let service: AuthService

  const usersService = {
    findByEmail: jest.fn<UsersService['findByEmail']>(),
    create: jest.fn<UsersService['create']>(),
    getOne: jest.fn<UsersService['getOne']>()
  }

  const jwtService = {
    signAsync: jest.fn<JwtService['signAsync']>(),
    verifyAsync: jest.fn<JwtService['verifyAsync']>(),
  }

  beforeEach(async () => {
    jest.resetAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
          AuthService,
        {
          provide: UsersService,
          useValue: usersService
        }, {
          provide: JwtService,
          useValue: jwtService
        }
      ]
    }).compile()

    service = module.get<AuthService>(AuthService);
  })

  describe('register', () => {
    it('Should return token and onBoardingCompleted after successful register', async () => {
      // Arrange
      usersService.findByEmail.mockResolvedValue(null)
      usersService.create.mockResolvedValue({
        id: 'user1',
        onboardingCompleted: false,
      } as User)

      jwtService.signAsync.mockResolvedValue('accessToken')

      // Act
      const result = await service.register({email: 'test@gmail.com', name: 'user1', password: 'testPassword'})

      // Assert
      expect(result).toEqual({
        accessToken: 'accessToken',
        onboardingCompleted: false
      })
      expect(usersService.findByEmail).toHaveBeenCalledWith('test@gmail.com');
      expect(usersService.create).toHaveBeenCalledTimes(1);
      expect(jwtService.signAsync).toHaveBeenCalledTimes(1);
    })

    it('Should throw if user with email already exists', async () => {
      // Arrange
      usersService.findByEmail.mockResolvedValue({
        id: 'user2',
        email: 'user1@gmail.com'
      } as User)

      // Act

      // Assert
      await expect(
          service.register({email: 'user1@gmail.com', name: 'user1', password: 'testPassword'})
      ).rejects.toThrow(ConflictException);

      expect(usersService.create).not.toHaveBeenCalled();
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    })
  })

  describe('login', () => {

  })
})