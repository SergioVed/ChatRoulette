import {Test, TestingModule} from '@nestjs/testing';
import {ChatService} from './chat.service';
import {beforeEach, describe, expect, it, jest} from '@jest/globals';
import {UserSkillsService} from "../user-skills/user-skills.service";
import {CallService} from "../calls/call.service";
import WebSocket from "ws";
import {AuthenticatedUser} from "./types";
import {UnauthorizedException} from "@nestjs/common";
import {UserSkillRole} from "../user-skills/types";
import {User} from "../users/user.entity";
import {Skill} from "../skills/skill.entity";
import {Call} from "../calls/call.entity";
import {UserSkill} from "../user-skills/user-skill.entity";

describe('ChatService', () => {
  let service: ChatService;

  const callService = {
    createCall: jest.fn<CallService['createCall']>()
  }

  const userSkillService = {
    findOne: jest.fn<UserSkillsService['findOne']>()
  }

  function createMockSocket (): WebSocket {
    return {
      readyState: WebSocket.OPEN,
      send: jest.fn(),
      close: jest.fn()
    } as unknown as WebSocket
  }

  function authenticateClient (
      client: WebSocket,
      userId: string
  ) {
    service.addClientToAuthenticatedSocketUsers(client, {
      userId,
      exp: Math.floor(Date.now() / 1000) + 3600
    });
  }

  function createUserSkill(
      userId: string,
      skillId: string,
      role: UserSkillRole
  ): UserSkill {
    return {
      user: { id: userId, name: userId } as User,
      skill: { id: skillId, name: skillId } as Skill,
      userId,
      skillId,
      role
    };
  }

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
          ChatService,
        {
          provide: UserSkillsService,
          useValue: userSkillService
        },
        {
          provide: CallService,
          useValue: callService
        }
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
  });

  describe('Authenticated user tests', () => {
    it('Should return an authenticated user', () => {
      const client = {} as WebSocket;

      const user: AuthenticatedUser = {
        userId: 'user1',
        exp: Math.floor(Date.now() / 1000) + 3600
      }

      service.addClientToAuthenticatedSocketUsers(client, user)

      const result = service.getClientFromAuthenticatedSocketUsers(client)
      expect(result).toEqual(user);
    })

    it('Should throw if client is not authenticated', () => {
      const client = {} as WebSocket;

      expect(() => {
        service.getClientFromAuthenticatedSocketUsers(client)
      }).toThrow(UnauthorizedException)
    })

    it ('Should throw if client jwt is expired', () => {
      const client = {} as WebSocket

      const user: AuthenticatedUser = {
        userId: 'user1',
        exp: Math.floor(Date.now() / 1000) - 3600
      }

      service.addClientToAuthenticatedSocketUsers(client, user)

      expect(() => {
        service.getClientFromAuthenticatedSocketUsers(client)
      }).toThrow(UnauthorizedException)
    })

    it ('should throw after removing an authenticated client', () => {
      const client = {} as WebSocket

      const user: AuthenticatedUser = {
        userId: 'user1',
        exp: Math.floor(Date.now() / 1000) + 3600
      }

      service.addClientToAuthenticatedSocketUsers(client, user)
      service.removeFromAuthenticatedSocketUsers(client)

      expect(() => {
        service.getClientFromAuthenticatedSocketUsers(client)
      }).toThrow(UnauthorizedException)
    })
  })
  describe('Matchmaking', () => {
    const user1Id = 'user-1'
    const user2Id = 'user-2'

    const skill1Id = 'skill-1'
    const skill2Id = 'skill-2'

    it('Should queue client when no partner found', async () => {
      const client = createMockSocket()
      authenticateClient(client, user1Id)
      userSkillService.findOne.mockResolvedValue(
          createUserSkill(user1Id, skill1Id, UserSkillRole.TEACHER)
      )

      const result = await service.findPartnerOrQueueClient(client, skill1Id, user1Id)

      expect(result).toEqual(null)
    })


    it('Should pair clients with same skill and different roles', async () => {
      const client1 = createMockSocket()
      const client2 = createMockSocket()

      authenticateClient(client1, user1Id)
      authenticateClient(client2, user2Id)


      userSkillService.findOne.mockResolvedValueOnce(
          createUserSkill(user1Id, skill1Id, UserSkillRole.TEACHER)
      ).mockResolvedValueOnce(
          createUserSkill(user2Id, skill1Id, UserSkillRole.STUDENT)
      );

      callService.createCall.mockResolvedValue({
        id: 'call-1'
      } as Call);

      const result1 = await service.findPartnerOrQueueClient(
          client1, skill1Id, user1Id
      );

      const result2 = await service.findPartnerOrQueueClient(
          client2, skill1Id, user2Id
      );


      expect(result1).toBeNull();
      expect(result2).not.toBeNull();

      expect(service.findPairedClient(client1)).toBe(client2);
      expect(service.findPairedClient(client2)).toBe(client1);

      expect(callService.createCall).toHaveBeenCalledTimes(1);
      expect(callService.createCall).toHaveBeenCalledWith(
          user2Id,
          user1Id,
          skill1Id,
          expect.any(Date)
      );

      expect(result2).toEqual({
        callId: 'call-1',
        initiator: {
          socket: client2,
          name: user2Id
        },
        receiver: {
          socket: client1,
          name: user1Id
        },
        skillName: skill1Id
      });
    })

    it('Should queue both client if skills are different', async () => {

      // Arrange
      const client1 = createMockSocket()
      const client2 = createMockSocket()

      authenticateClient(client1, user1Id)
      authenticateClient(client2, user2Id)

      userSkillService.findOne.mockResolvedValueOnce(
          createUserSkill(user1Id, skill1Id, UserSkillRole.TEACHER)
      ).mockResolvedValueOnce(
          createUserSkill(user2Id, skill2Id, UserSkillRole.STUDENT)
      )

      callService.createCall.mockResolvedValue({
        id: 'call-1'
      } as Call);

      // Act
      const result1 = await service.findPartnerOrQueueClient(client1, 'skill-1', 'user1')
      const result2 = await service.findPartnerOrQueueClient(client2, 'skill-2', 'user2')


      // Assert
      expect(result1).toBeNull();
      expect(result2).toBeNull();

      expect(service.findPairedClient(client1)).toBeUndefined();
      expect(service.findPairedClient(client2)).toBeUndefined();

      expect(callService.createCall).not.toHaveBeenCalled();
    })

    it('Should not pair clients with the same role', async () => {
      // Arrange
      const client1 = createMockSocket()
      const client2 = createMockSocket()

      authenticateClient(client1, user1Id)
      authenticateClient(client2, user2Id)

      userSkillService.findOne.mockResolvedValueOnce(
          createUserSkill(user1Id, skill1Id, UserSkillRole.TEACHER)
      ).mockResolvedValueOnce(
          createUserSkill(user2Id, skill1Id, UserSkillRole.TEACHER)
      )

      // Act
      const result1 = await service.findPartnerOrQueueClient(client1, 'skill-1', 'user1')
      const result2 = await service.findPartnerOrQueueClient(client2, 'skill-1', 'user2')

      // Assert
      expect(result1).toBeNull();
      expect(result2).toBeNull();

      expect(service.findPairedClient(client1)).toBeUndefined();
      expect(service.findPairedClient(client2)).toBeUndefined();

      expect(callService.createCall).not.toHaveBeenCalled();
    })

    it('Should not match a client after cancelling their search', async () => {
      // Arrange
      const client1 = createMockSocket()
      const client2 = createMockSocket()

      userSkillService.findOne.mockResolvedValueOnce(
          createUserSkill(user1Id, skill1Id, UserSkillRole.TEACHER)
      ).mockResolvedValueOnce(
          createUserSkill(user2Id, skill1Id, UserSkillRole.STUDENT)
      )

      // Act
      authenticateClient(client1, user1Id)
      authenticateClient(client2, user2Id)

      const result1 = await service.findPartnerOrQueueClient(client1, 'skill-1', 'user1')
      service.cancelSearch(client1)
      const result2 = await service.findPartnerOrQueueClient(client2, 'skill-1', 'user2')

      // Assert
      expect(callService.createCall).not.toHaveBeenCalled()
      expect(result1).toBeNull();
      expect(result2).toBeNull();
    })

    it('Should remove both partners when removing a pair', async () => {
      // Arrange
      const client1 = createMockSocket()
      const client2 = createMockSocket()

      userSkillService.findOne.mockResolvedValueOnce(
          createUserSkill(user1Id, skill1Id, UserSkillRole.TEACHER)
      ).mockResolvedValueOnce(
          createUserSkill(user2Id, skill1Id, UserSkillRole.STUDENT)
      )

      callService.createCall.mockResolvedValue({
        id: 'call-1'
      } as Call);

      // Act
      authenticateClient(client1, user1Id)
      authenticateClient(client2, user2Id)

      await service.findPartnerOrQueueClient(client1, 'skill-1', 'user1')
      await service.findPartnerOrQueueClient(client2, 'skill-1', 'user2')
      service.removePair(client1)

      const result1 = service.findPairedClient(client1)
      const result2 = service.findPairedClient(client2)

      // Assert
      expect(result1).toBeUndefined();
      expect(result2).toBeUndefined();
    })
  })
});

