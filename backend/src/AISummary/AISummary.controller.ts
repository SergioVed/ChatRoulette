import {Body, Controller, Get, Post, UploadedFile, UseInterceptors} from '@nestjs/common';
import {AISummaryService} from "./AISummary.service";
import {FileInterceptor} from "@nestjs/platform-express";
import type {Express} from "express";

@Controller('AISummary')
export class AISummaryController {

    constructor(private openaiService: AISummaryService) {}

    @Post()
    @UseInterceptors(FileInterceptor('audio'))
    public async summarize (@UploadedFile() file: Express.Multer.File) {
        const transcription = await this.openaiService.generateTranscription(file)

        return await this.openaiService.summarize(transcription)
    }

}
