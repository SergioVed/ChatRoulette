import {Body, Controller, Get, Post, UploadedFile, UseGuards, UseInterceptors} from '@nestjs/common';
import {AISummaryService} from "./AISummary.service";
import {FileInterceptor} from "@nestjs/platform-express";
import type {Express} from "express";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";

@Controller('AISummary')
export class AISummaryController {

    constructor(private service: AISummaryService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    @UseInterceptors(FileInterceptor('audio'))
    public async summarize (@UploadedFile() file: Express.Multer.File) {
        const transcription = await this.service.generateTranscription(file)
        return await this.service.summarize(transcription)
    }

}
