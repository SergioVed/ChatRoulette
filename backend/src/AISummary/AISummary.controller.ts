import {Body, Controller, Get, Post, Req, UploadedFile, UseGuards, UseInterceptors} from '@nestjs/common';
import {AISummaryService} from "./AISummary.service";
import {FileInterceptor} from "@nestjs/platform-express";
import type {Express} from "express";
import {AuthenticatedRequest, JwtAuthGuard} from "../auth/jwt-auth.guard";
import {CreateSummaryDto} from "./dto/create-summary.dto";

@Controller('AISummary')
export class AISummaryController {

    constructor(private service: AISummaryService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    @UseInterceptors(FileInterceptor('audio'))
    public async summarize (
        @UploadedFile() file: Express.Multer.File,
        @Body() dto: CreateSummaryDto,
        @Req() req: AuthenticatedRequest
    ) {
        const transcription = await this.service.generateTranscription(file)
        const text = await this.service.summarize(transcription)
        return await this.service.save(text, dto.skillId, req.user.id)
    }

}
