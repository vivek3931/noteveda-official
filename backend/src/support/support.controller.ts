import { Controller, Get, Post, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SupportService } from './support.service';
import { TicketPriority } from '@prisma/client';

@ApiTags('Support')
@Controller('support')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SupportController {
    constructor(private supportService: SupportService) { }

    @Post('tickets')
    @ApiOperation({ summary: 'Create a support ticket' })
    async createTicket(@Request() req: any, @Body() body: { subject: string; message: string; priority?: TicketPriority }) {
        return this.supportService.createTicket(req.user.id, body.subject, body.message, body.priority);
    }

    @Get('tickets')
    @ApiOperation({ summary: 'Get my tickets' })
    async getMyTickets(@Request() req: any) {
        return this.supportService.getUserTickets(req.user.id);
    }

    @Get('tickets/:id')
    @ApiOperation({ summary: 'Get ticket details' })
    async getTicket(@Request() req: any, @Param('id') id: string) {
        return this.supportService.getTicket(req.user.id, id);
    }

    @Post('tickets/:id/reply')
    @ApiOperation({ summary: 'Reply to ticket' })
    async replyToTicket(@Request() req: any, @Param('id') id: string, @Body() body: { message: string }) {
        return this.supportService.replyToTicket(req.user.id, id, body.message);
    }

    @Get('faqs')
    @ApiOperation({ summary: 'Get FAQs' })
    async getFAQs(@Query('category') category?: string) {
        return this.supportService.getFAQs(category);
    }
}
