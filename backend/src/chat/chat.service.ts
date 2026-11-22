import {BadRequestException, Injectable, NotFoundException, UnauthorizedException} from '@nestjs/common';
import {AuthenticatedUser, ErrorCode, QueueObj} from "./types";
import {UserSkillsService} from "../user-skills/user-skills.service";
import {UserSkill} from "../user-skills/user-skill.entity";
import WebSocket from 'ws';
import {ErrorMessage} from "./messages/ErrorMessage";

@Injectable()
export class ChatService {

    private queue: QueueObj[]
    private partners: Map<WebSocket, WebSocket>
    private socketUsers: Map<WebSocket, AuthenticatedUser>

    constructor(
        private userSkillsService: UserSkillsService
    ) {
        this.queue = [];
        this.partners = new Map<WebSocket, WebSocket>()
        this.socketUsers = new Map<WebSocket, AuthenticatedUser>()

    }

    public getClientFromSocketUsers (client: WebSocket) {
        const user = this.socketUsers.get(client)

        if (!user || user.exp * 1000 < Date.now()) {
            throw new UnauthorizedException()
        }

        return user
    }

    public addClientToSocketUsers (client: WebSocket, user: AuthenticatedUser) {
        this.socketUsers.set(client, user)
    }

    public findPairedClient (client: WebSocket) {
        return this.partners.get(client)
    }

    public removeFromQueue (client: WebSocket) {
        this.queue = this.queue.filter(socket => socket.client !== client);
    }

    public removeFromSocketUsers (client: WebSocket) {
        this.socketUsers.delete(client)
    }

    public removePair (client: WebSocket) {
        const partner = this.partners.get(client)

        this.partners.delete(client)
        if (partner) {
            this.partners.delete(partner)
        }
    }

    public async addClientToQueue (requestingClient: WebSocket, skillId: string, userId: string) {
        const existing = this.queue.find((client) => client.client === requestingClient)
        if (existing || this.partners.has(requestingClient)) {
            this.removeFromQueue(requestingClient)
            this.partners.delete(requestingClient)
        }

        const currentUserSkill = await this.userSkillsService.findOne(userId, skillId)
        if (!currentUserSkill) {
            throw new BadRequestException()
        }


        if (requestingClient.readyState !== WebSocket.OPEN) {
            return;
        }

        if (!this.getClientFromSocketUsers(requestingClient)) {
            throw new UnauthorizedException();
        }

        const partner = this.findPartner(currentUserSkill)

        if (partner != null) {
            this.removeFromQueue(partner.client)
            this.matchClients(requestingClient, partner.client)

            return {
                initiator: requestingClient,
                receiver: partner.client
            }
        } else {
            this.queue.push({
                client: requestingClient,
                userId: userId,
                skillId: skillId,
                role: currentUserSkill.role
            })
        }
    }

    private findPartner (requestingUser: UserSkill): QueueObj | null {

        for (const entry of this.queue) {
            try {
                this.getClientFromSocketUsers(entry.client)
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
                entry.skillId === requestingUser.skillId &&
                entry.role !== requestingUser.role &&
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

        return {
            initiator: waitingClient,
            receiver: client
        }
    }

}
