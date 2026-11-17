import { Injectable } from '@nestjs/common';
import {QueueObj} from "./types";
import {UserSkillsService} from "../user-skills/user-skills.service";
import {UserSkill} from "../user-skills/user-skill.entity";

@Injectable()
export class UserMatchingService {

    private queue: QueueObj[]
    private partners: Map<WebSocket, WebSocket>
    private socketUsers: Map<WebSocket, string>

    constructor(
        private userSkillsService: UserSkillsService
    ) {
        this.queue = [];
        this.partners = new Map<WebSocket, WebSocket>()
        this.socketUsers = new Map<WebSocket, string>()

    }

    public getClientFromSocketUsers (client: WebSocket) {
        return this.socketUsers.get(client)
    }

    public addClientToSocketUsers (client: WebSocket, userId: string) {
        this.socketUsers.set(client, userId)
    }

    public findPairedClient (client: WebSocket) {
        return this.partners.get(client)
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
            return
        }

        const currentUserSkill = await this.userSkillsService.findOne(userId, skillId)
        if (!currentUserSkill) {
            return
        }

        const partner = this.findPartner(skillId, currentUserSkill)

        if (partner != null) {
            this.queue = this.queue.filter(client => client !== partner)
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
            console.log(this.queue)

        }
    }

    private findPartner (skillId: string, requestingUser: UserSkill): QueueObj | null {
        const client = this.queue.find(client => {
            return client.skillId === requestingUser.skillId && client.role !== requestingUser.role
        })

        return client ?? null
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
