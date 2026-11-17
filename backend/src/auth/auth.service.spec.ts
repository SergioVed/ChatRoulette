import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { argon2id, hash, verify } from 'argon2';
import { QueryFailedError } from 'typeorm';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let module: TestingModule;
  let service: AuthService;
  let passwordHash: string;
  const userId = '550e8400-e29b-41d4-a716-446655440000';
  const credentials = { email: 'test@example.com', password: ' testPassword123 ' };
  const registration = { name: ' Test ', ...credentials, email: ' TEST@example.com ' };
  const users = {
    findByEmail: vi.fn<UsersService['findByEmail']>(),
    create: vi.fn<UsersService['create']>(),
  };
  const jwt = {
    signAsync: vi.fn<(payload: { sub: string }) => Promise<string>>(),
  };

  function existingUser(): User {
    return { id: userId, name: 'Test', email: credentials.email, passwordHash, onboardingCompleted: false };
  }

  beforeAll(async () => {
    passwordHash = await hash(credentials.password, { type: argon2id });
  });

  beforeEach(async () => {
    vi.resetAllMocks();
    // Suppress the service's existing debug log of the synthetic user fixture.

    users.findByEmail.mockResolvedValue(null);
    users.create.mockImplementation(async (name, email, storedHash) => ({
      id: userId, name, email, passwordHash: storedHash, onboardingCompleted: false,
    }));
    jwt.signAsync.mockResolvedValue('test-token');

    module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: users },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();
    await module.init();
    service = module.get(AuthService);
  });

  afterEach(async () => {
    try {
      await module?.close();
    } finally {
      vi.restoreAllMocks();
    }
  });

  describe('register', () => {
    it('normalizes account fields, hashes the exact password and returns the token and onboarding status', async () => {
      const result = await service.register(registration);

      expect(users.findByEmail).toHaveBeenCalledExactlyOnceWith(credentials.email);
      expect(users.create).toHaveBeenCalledOnce();
      const [name, email, storedHash] = users.create.mock.calls[0];
      expect(name).toBe('Test');
      expect(email).toBe(credentials.email);
      expect(storedHash).toMatch(/^\$argon2id\$/);
      expect(await verify(storedHash, credentials.password)).toBe(true);
      expect(await verify(storedHash, credentials.password.trim())).toBe(false);
      expect(jwt.signAsync).toHaveBeenCalledExactlyOnceWith({ sub: userId });
      expect(result).toEqual({ accessToken: 'test-token', onboardingCompleted: false });
    });

    it('returns completed onboarding from the saved user', async () => {
      users.create.mockResolvedValue({ ...existingUser(), onboardingCompleted: true });

      await expect(service.register(registration)).resolves.toEqual({
        accessToken: 'test-token', onboardingCompleted: true,
      });
    });

    it('rejects an existing email without creating an account or signing a token', async () => {
      users.findByEmail.mockResolvedValue(existingUser());

      await expect(service.register(registration)).rejects.toBeInstanceOf(ConflictException);
      expect(users.create).not.toHaveBeenCalled();
      expect(jwt.signAsync).not.toHaveBeenCalled();
    });

    it('converts a concurrent registration unique violation into a conflict', async () => {
      const databaseError = new QueryFailedError('INSERT INTO users', [],
        Object.assign(new Error('duplicate email'), { code: '23505' }));
      users.create.mockRejectedValue(databaseError);

      await expect(service.register(registration)).rejects.toBeInstanceOf(ConflictException);
      expect(users.create).toHaveBeenCalledOnce();
      expect(jwt.signAsync).not.toHaveBeenCalled();
    });

    it('propagates other database errors without signing a token', async () => {
      const databaseError = new QueryFailedError('INSERT INTO users', [],
        Object.assign(new Error('database unavailable'), { code: '08006' }));
      users.create.mockRejectedValue(databaseError);

      await expect(service.register(registration)).rejects.toBe(databaseError);
      expect(jwt.signAsync).not.toHaveBeenCalled();
    });

    it('propagates lookup failures without creating an account or signing a token', async () => {
      const error = new Error('lookup failed');
      users.findByEmail.mockRejectedValue(error);

      await expect(service.register(registration)).rejects.toBe(error);
      expect(users.create).not.toHaveBeenCalled();
      expect(jwt.signAsync).not.toHaveBeenCalled();
    });

    it('propagates token-signing failures after creating the account', async () => {
      const error = new Error('signing failed');
      jwt.signAsync.mockRejectedValue(error);

      await expect(service.register(registration)).rejects.toBe(error);
      expect(users.create).toHaveBeenCalledOnce();
      expect(jwt.signAsync).toHaveBeenCalledExactlyOnceWith({ sub: userId });
    });
  });

  describe('login', () => {
    it('verifies the password and signs a token for the existing user', async () => {
      users.findByEmail.mockResolvedValue(existingUser());

      await expect(service.login(credentials)).resolves.toEqual({ accessToken: 'test-token' });
      expect(users.findByEmail).toHaveBeenCalledExactlyOnceWith(credentials.email);
      expect(jwt.signAsync).toHaveBeenCalledExactlyOnceWith({ sub: userId });
      expect(users.create).not.toHaveBeenCalled();
    });

    it.each(['incorrect password', 'unknown user', 'missing hash'] as const)(
      'returns the same unauthorized error for %s', async (scenario) => {
        if (scenario === 'incorrect password') {
          users.findByEmail.mockResolvedValue(existingUser());
        } else if (scenario === 'missing hash') {
          users.findByEmail.mockResolvedValue({ ...existingUser(), passwordHash: null });
        }

        const attempt = service.login({ ...credentials, password: 'incorrect' });
        await expect(attempt).rejects.toBeInstanceOf(UnauthorizedException);
        await expect(attempt).rejects.toMatchObject({
          message: 'Invalid email or password',
          response: { statusCode: 401, message: 'Invalid email or password' },
        });
        expect(jwt.signAsync).not.toHaveBeenCalled();
        expect(users.create).not.toHaveBeenCalled();
      },
    );

    it('propagates lookup failures without creating an account or signing a token', async () => {
      const error = new Error('lookup failed');
      users.findByEmail.mockRejectedValue(error);

      await expect(service.login(credentials)).rejects.toBe(error);
      expect(jwt.signAsync).not.toHaveBeenCalled();
      expect(users.create).not.toHaveBeenCalled();
    });

    it('propagates token-signing failures after verifying credentials', async () => {
      const error = new Error('signing failed');
      users.findByEmail.mockResolvedValue(existingUser());
      jwt.signAsync.mockRejectedValue(error);

      await expect(service.login(credentials)).rejects.toBe(error);
      expect(jwt.signAsync).toHaveBeenCalledExactlyOnceWith({ sub: userId });
      expect(users.create).not.toHaveBeenCalled();
    });
  });
});
