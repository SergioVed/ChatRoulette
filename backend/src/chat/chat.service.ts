import {BadRequestException, Injectable, NotFoundException, UnauthorizedException} from '@nestjs/common';
import {AuthenticatedUser, ErrorCode, PairedUsersResponse, QueueObj, SkillData, UserData} from "./types";
import {UserSkillsService} from "../user-skills/user-skills.service";
import {UserSkill} from "../user-skills/user-skill.entity";
import WebSocket from 'ws';
import {ErrorMessage} from "./messages/ErrorMessage";
import {UsersService} from "../users/users.service";
import {SkillsService} from "../skills/skills.service";
import {QueueEntry} from "./domain/QueueEntry";
import {UserSkillRole} from "../user-skills/types";
import { CallService } from '../calls/call.service';

@Injectable()
export class ChatService {

    private queue: QueueObj[]
    private partners: Map<WebSocket, WebSocket>
    private authenticatedSocketUsers: Map<WebSocket, AuthenticatedUser>

    constructor(
        private userSkillsService: UserSkillsService,
        private readonly calls: CallService,
    ) {
        this.queue = [];
        this.partners = new Map<WebSocket, WebSocket>()
        this.authenticatedSocketUsers = new Map<WebSocket, AuthenticatedUser>()
    }

    public getClientFromAuthenticatedSocketUsers (client: WebSocket) {
        const user = this.authenticatedSocketUsers.get(client)

        if (!user || user.exp * 1000 < Date.now()) {
            throw new UnauthorizedException()
        }

        return user
    }

    public addClientToAuthenticatedSocketUsers (client: WebSocket, user: AuthenticatedUser) {
        this.authenticatedSocketUsers.set(client, user)
    }

    public findPairedClient (client: WebSocket) {
        return this.partners.get(client)
    }

    public removeFromQueue (client: WebSocket) {
        this.queue = this.queue.filter(socket => socket.client !== client);
    }

    public cancelSearch (client: WebSocket) {
        this.removeFromQueue(client)
    }

    public removeFromAuthenticatedSocketUsers (client: WebSocket) {
        this.authenticatedSocketUsers.delete(client)
    }

    public removePair (client: WebSocket) {
        const partner = this.partners.get(client)

        this.partners.delete(client)
        if (partner) {
            this.partners.delete(partner)
        }
    }

    public async findPartnerOrQueueClient (requestingClient: WebSocket, skillId: string, userId: string): Promise<PairedUsersResponse | null> {
        if (this.isInQueue(requestingClient) || this.isPartner(requestingClient)) {
            this.removeFromQueue(requestingClient)
            this.removePair(requestingClient)
        }

        const currentUserSkill = await this.userSkillsService.findOne(userId, skillId)
        if (!currentUserSkill) {
            throw new BadRequestException()
        }

        // Check if client ready to connect and if Authorized
        if (!this.isReadyToConnect(requestingClient)) return null

        const partner = this.findPartner(currentUserSkill)

        if (partner != null) {
            this.removeFromQueue(partner.client)
            this.matchClients(requestingClient, partner.client)
            const call = await this.calls.createCall(
                currentUserSkill.user.id, partner.user.userId, currentUserSkill.skill.id, new Date(),
            );

            return {
                callId: call.id,
                initiator: {
                    socket: requestingClient,
                    name: currentUserSkill.user.name
                },
                receiver: {
                    socket: partner.client,
                    name: partner.user.name
                },
                skillName: currentUserSkill.skill.name
            }
        } else {
            this.addToQueue(requestingClient, currentUserSkill)
            return null
        }
    }

    private addToQueue (client: WebSocket, userSkill: UserSkill) {
        const userData: UserData = {
            userId: userSkill.user.id,
            name: userSkill.user.name
        }

        const skillData: SkillData = {
            skillId: userSkill.skill.id,
            name: userSkill.skill.name,
        }

        const queueEntry = new QueueEntry(client, userData, skillData, userSkill.role)
        this.queue.push(queueEntry)
    }

    private isInQueue (client: WebSocket) {
        return this.queue.find((entry) => entry.client === client);
    }

    private isPartner (client: WebSocket) {
        return this.partners.has(client)
    }


    private isReadyToConnect (client: WebSocket): boolean {
        if (client.readyState !== WebSocket.OPEN) {
            return false;
        }

        this.getClientFromAuthenticatedSocketUsers(client);

        return true
    }

    private findPartner (userSkill: UserSkill): QueueObj | null {

        for (const entry of this.queue) {
            try {
                this.getClientFromAuthenticatedSocketUsers(entry.client)
            } catch (error) {
                if (error instanceof UnauthorizedException) {
                    this.removeFromQueue(entry.client);
                    entry.client.send(JSON.stringify(new ErrorMessage(ErrorCode.AUTH_REQUIRED)))
                    entry.client.close(1008, 'Required to be authenticated')
                    continue;
                }

                throw error;
            }

            if (
                entry.skill.skillId === userSkill.skillId &&
                entry.role !== userSkill.role &&
                entry.client.readyState === WebSocket.OPEN
            ) {
                return entry;
            }
        }

        return null
    }

    private matchClients (client: WebSocket, waitingClient: WebSocket) {
        if (waitingClient) {
            this.partners.set(client, waitingClient)
            this.partners.set(waitingClient, client)
        }
    }

}