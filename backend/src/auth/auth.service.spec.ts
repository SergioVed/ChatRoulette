import { afterEach, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import {AuthService} from "./auth.service";
import {Test, TestingModule} from "@nestjs/testing";
import {UsersService} from "../users/users.service";
import {JwtService} from "@nestjs/jwt";
import {User} from "../users/user.entity";
import {ConflictException, UnauthorizedException} from "@nestjs/common";
import {argon2id, hash, verify} from 'argon2';

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
    const credentials = {name: 'testName', email: 'user1@example.com', password: 'testPassword'}

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
      const hashedPassword = usersService.create.mock.calls[0][2];
      // Assert
      expect(result).toEqual({
        accessToken: 'accessToken',
        onboardingCompleted: false
      })
      expect(hashedPassword).not.toEqual(credentials.password)
      expect(
          await verify(hashedPassword, credentials.password)
      ).toBe(true);

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
    const credentials = {email: 'user1@example.com', password: 'testPassword'}
    const user = {id: 'user1', email: credentials.email}
    let passwordHash: string

    beforeAll(async () => {
      passwordHash = await hash(credentials.password, {type: argon2id})
    })

    it('Should return an access token after successful login', async () => {
      // Arrange
      usersService.findByEmail.mockResolvedValue({...user, passwordHash} as User)
      jwtService.signAsync.mockResolvedValue('accessToken')

      // Act
      const result = await service.login(credentials)

      // Assert
      expect(result).toEqual({accessToken: 'accessToken'});
      expect(usersService.findByEmail).toHaveBeenCalledWith(credentials.email);
      expect(jwtService.signAsync).toHaveBeenCalledWith({sub: user.id});
    })

    it('Should reject login with an incorrect password', async () => {
      // Arrange
      usersService.findByEmail.mockResolvedValue({...user, passwordHash} as User)

      // Act and assert
      await expect(
          service.login({...credentials, password: 'wrongPassword'})
      ).rejects.toThrow(UnauthorizedException);

      expect(jwtService.signAsync).not.toHaveBeenCalled();
    })

    it('Should reject login when the user does not exist', async () => {
      // Arrange
      await service.onModuleInit()
      usersService.findByEmail.mockResolvedValue(null)

      // Act and assert
      await expect(service.login(credentials)).rejects.toThrow(UnauthorizedException);
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    })

    it('Should reject login when the user has no password hash', async () => {
      // Arrange
      await service.onModuleInit()
      usersService.findByEmail.mockResolvedValue({...user, passwordHash: null} as User)

      // Act and assert
      await expect(service.login(credentials)).rejects.toThrow(UnauthorizedException);
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    })
  })
})
