import OpenAI from "openai";
import { BadGatewayException, BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { Express } from 'express';
import Groq, {toFile} from "groq-sdk";
import {instructions} from "./utils/instructions";
import {Summary} from "./summary.entity";
import { CallService } from '../calls/call.service';
import {InjectRepository} from "@nestjs/typeorm";
import { QueryFailedError, Repository } from 'typeorm';


@Injectable()
export class AISummaryService {

    constructor(
        @InjectRepository(Summary) readonly repository: Repository<Summary>,
        private readonly calls: CallService,
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

    async requireParticipant(callId: string, userId: string): Promise<void> {
        const call = await this.calls.findCallById(callId);
        if (!call || (call.userOneId !== userId && call.userTwoId !== userId)) {
            throw new NotFoundException('Call not found');
        }
    }

    async save(text: string, callId: string): Promise<Summary> {
        const summary = this.repository.create({ text, callId });
        try {
            return await this.repository.save(summary);
        } catch (error) {
            if (error instanceof QueryFailedError) {
                const { code } = error.driverError
                if (code === '23505') {
                    throw new ConflictException('Call already has a summary');
                }
            }
            throw error;
        }
    }
}
