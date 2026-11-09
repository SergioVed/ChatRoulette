import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { User } from './user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let module: TestingModule;
  let service: UsersService;

  const repository = {
    findOne: vi.fn(),
    create: vi.fn<(fields: Pick<User, 'name' | 'email' | 'passwordHash'>) => User>(),
    save: vi.fn<(user: User) => Promise<User>>(),
  };

  function userFixture(): User {
    return {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Test',
      email: 'test@example.com',
      passwordHash: 'stored-password-hash',
    };
  }

  beforeEach(async () => {
    vi.resetAllMocks();
    repository.findOne.mockResolvedValue(null)

    module = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: repository },
      ],
    }).compile();
    service = module.get(UsersService);
  });

  afterEach(async () => {
    await module?.close();
  });

  describe('findByEmail', () => {
    it('normalizes the email, explicitly selects the password hash and returns the user', async () => {
      const user = userFixture();
      repository.findOne.mockResolvedValue(user);

      await expect(service.findByEmail(' TEST@example.com ')).resolves.toBe(user);

      expect(repository.findOne).toHaveBeenCalledOnce();
    });

    it('returns null when no user exists', async () => {
      await expect(service.findByEmail('missing@example.com')).resolves.toBeNull();
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('propagates lookup errors', async () => {
      const error = new Error('database unavailable');
      repository.findOne.mockRejectedValue(error);

      await expect(service.findByEmail('test@example.com')).rejects.toBe(error);
    });
  });

  describe('create', () => {
    it('constructs an entity with the supplied hash and returns the saved user', async () => {
      const entity = Object.assign(new User(), {
        name: 'Test', email: 'test@example.com', passwordHash: 'supplied-hash',
      });
      const savedUser = { ...entity, id: userFixture().id };
      repository.create.mockReturnValue(entity);
      repository.save.mockResolvedValue(savedUser);

      await expect(service.create(entity.name, entity.email, entity.passwordHash!))
        .resolves.toBe(savedUser);
      expect(repository.create).toHaveBeenCalledExactlyOnceWith({
        name: 'Test', email: 'test@example.com', passwordHash: 'supplied-hash',
      });
      expect(repository.save).toHaveBeenCalledExactlyOnceWith(entity);
      expect(repository.save.mock.calls[0][0]).toBe(entity);
    });

    it('propagates persistence errors so the caller can handle duplicate registrations', async () => {
      const entity = userFixture();
      const error = Object.assign(new Error('duplicate email'), { code: '23505' });
      repository.create.mockReturnValue(entity);
      repository.save.mockRejectedValue(error);

      await expect(service.create(entity.name, entity.email, entity.passwordHash!))
        .rejects.toBe(error);
    });
  });
});
