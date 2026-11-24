import {QueueObj, SkillData, UserData} from "../types";
import {WebSocket} from "ws";
import {UserSkillRole} from "../../user-skills/types";

export class QueueEntry implements QueueObj{
    public client!: WebSocket
    public user!: UserData
    public skill!: SkillData
    public role!: UserSkillRole

    constructor(client: WebSocket, user: UserData, skill: SkillData, role: UserSkillRole) {
        this.client = client;
        this.user = user;
        this.skill = skill
        this.role = role;
    }
}