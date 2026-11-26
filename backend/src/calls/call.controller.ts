import { Controller, Get, NotFoundException, Param, ParseUUIDPipe, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/jwt-auth.guard';
import { CallService } from './call.service';

@UseGuards(JwtAuthGuard)
@Controller('calls')
export class CallController {
    constructor(private readonly calls: CallService) {}

    @Get(':id')
    async findOne(@Param('id', ParseUUIDPipe) id: string, @Req() request: AuthenticatedRequest) {
        const call = await this.calls.findCallForParticipant(id, request.user.id);
        if (!call){
            throw new NotFoundException('Call not found');
        }
        return call;
    }
}
