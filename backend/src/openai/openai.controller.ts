import {Body, Controller, Get} from '@nestjs/common';
import {OpenaiService} from "./openai.service";

@Controller('openai')
export class OpenaiController {

    constructor(private openaiService: OpenaiService) {}

    @Get()
    public async summarize (@Body() data: {transcript: string}) {
        return await this.openaiService.summarize(data.transcript)
    }

}
