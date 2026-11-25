import OpenAI from "openai";
import {BadGatewayException, BadRequestException, HttpException, Injectable, NotFoundException} from "@nestjs/common";
import {Express, response} from "express";
import Groq, {toFile} from "groq-sdk";
import * as fs from "node:fs";
import {instructions} from "./utils/instructions";
import {Summary} from "./summary.entity";
import {SkillsService} from "../skills/skills.service";
import {InjectRepository} from "@nestjs/typeorm";
import {async} from "rxjs";
import {Repository} from "typeorm";


@Injectable()
export class AISummaryService {

    constructor(
        @InjectRepository(Summary) readonly repository: Repository<Summary>,
        private skillsService: SkillsService
    ) {}

    private readonly client = new OpenAI({
        apiKey: process.env.GROQ_API_KEY,
        baseURL: "https://api.groq.com/openai/v1",
    });
    private groq = new Groq({apiKey: process.env.GROQ_API_KEY});

    async summarize(transcript: string): Promise<string> {
        const response = await this.client.responses.create({
            model: "openai/gpt-oss-20b",
            instructions: instructions,
            input: transcript,
        });

        return response.output_text;
    }

    async generateTranscription(file: Express.Multer.File): Promise<string> {
        if (!file) {
            throw new BadRequestException('Audio file is required');
        }

        const newFile = await toFile(file.buffer, file.originalname, {
            type: file.mimetype,
        })

        try {
            const transcription = await this.groq.audio.transcriptions.create({
                file: newFile,
                model: "whisper-large-v3",
                temperature: 0,
                response_format: "verbose_json",
            });
            console.log(transcription.text)
            return transcription.text
        } catch (error) {
            throw new BadGatewayException('Transcription service failed')
        }
    }

    async save (text: string, skillId: string, userId: string) {
        const skill = await this.skillsService.findOne(skillId)
        if (!skill) {
            throw new NotFoundException('Skill does not exist')
        }

        const summary = this.repository.create({
            text,
            skillId,
            userId
        })

        return await this.repository.save(summary)
    }
}
