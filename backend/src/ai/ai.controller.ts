import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import type { Response as ExpressResponse } from 'express';
import { AiService } from './ai.service';
import { ChatRequestDto } from './dto/chat-request.dto';
import { JwtAuthGuard } from '../auth/guards';
import { Public } from '../auth/decorators/public.decorator';

@Controller('ai')
export class AiController {
    constructor(private readonly aiService: AiService) { }

    @Post('chat')
    // @UseGuards(JwtAuthGuard) // Can be uncommented to enforce auth
    async chat(@Body() dto: ChatRequestDto) {
        return this.aiService.chat(dto);
    }

    @Public()
    @Post('stream')
    async stream(@Body() dto: ChatRequestDto, @Res() res: ExpressResponse) {
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Transfer-Encoding', 'chunked');

        try {
            const stream = this.aiService.streamChat(dto);
            for await (const chunk of stream) {
                res.write(chunk);
            }
            res.end();
        } catch (error) {
            console.error('Streaming Error:', error);
            res.status(500).end('Streaming failed');
        }
    }
}
