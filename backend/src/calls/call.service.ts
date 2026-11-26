import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Call } from './call.entity';

@Injectable()
export class CallService {
    constructor(@InjectRepository(Call) private readonly calls: Repository<Call>) {}

    createCall(userOneId: string, userTwoId: string, skillId: string, startedAt: Date): Promise<Call> {
        const call = this.calls.create({ userOneId, userTwoId, skillId, startedAt, endedAt: null });
        return this.calls.save(call);
    }

    findCallById(id: string): Promise<Call | null> {
        return this.calls.findOne({ where: { id } });
    }

    async endCall(id: string): Promise<Call | null> {
        await this.calls.update({ id, endedAt: IsNull() }, { endedAt: new Date() });
        return this.findCallById(id);
    }
}
