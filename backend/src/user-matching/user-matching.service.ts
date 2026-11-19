import {Injectable, UnauthorizedException} from '@nestjs/common';
import {AuthenticatedUser, QueueObj} from "./types";
import {UserSkillsService} from "../user-skills/user-skills.service";
import {UserSkill} from "../user-skills/user-skill.entity";

@Injectable()
export class UserMatchingService {

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
        return this.socketUsers.get(client)
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

    public checkAuthenticatedSocket (client: WebSocket) {
        const user = this.socketUsers.get(client)
        if (!user || user.exp * 1000 < Date.now()) {
            return false
        }

        return true
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
            return
        }

        if (
            requestingClient.readyState !== WebSocket.OPEN ||
            !this.checkAuthenticatedSocket(requestingClient)
        ) {
            return
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
            console.log(this.queue)

        }
    }

    private findPartner (requestingUser: UserSkill): QueueObj | null {
        const client = this.queue.find(entry => {
            return entry.skillId === requestingUser.skillId &&
                entry.role !== requestingUser.role &&
                entry.client.readyState === WebSocket.OPEN &&
                this.checkAuthenticatedSocket(entry.client)
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
