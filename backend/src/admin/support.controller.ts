import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, TicketStatus, TicketPriority } from '@prisma/client';
import { SupportService } from './support.service';

@ApiTags('Admin Support')
@Controller('admin/support')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class SupportController {
    constructor(private supportService: SupportService) { }

    // Tickets
    @Get('tickets')
    @ApiOperation({ summary: 'Get support tickets' })
    @ApiQuery({ name: 'status', required: false, enum: TicketStatus })
    @ApiQuery({ name: 'priority', required: false, enum: TicketPriority })
    async getTickets(
        @Query('status') status?: TicketStatus,
        @Query('priority') priority?: TicketPriority,
    ) {
        return this.supportService.getTickets(status, priority);
    }

    @Get('tickets/:id')
    @ApiOperation({ summary: 'Get ticket details' })
    async getTicket(@Param('id') id: string) {
        return this.supportService.getTicket(id);
    }

    @Patch('tickets/:id/status')
    @ApiOperation({ summary: 'Update ticket status' })
    async updateTicketStatus(
        @Param('id') id: string,
        @Body() body: { status: TicketStatus },
    ) {
        return this.supportService.updateTicketStatus(id, body.status);
    }

    @Post('tickets/:id/reply')
    @ApiOperation({ summary: 'Reply to a ticket' })
    async replyToTicket(
        @Param('id') id: string,
        @Body() body: { message: string },
        @Request() req: any,
    ) {
        return this.supportService.replyToTicket(id, req.user.id, body.message);
    }

    // FAQs
    @Get('faqs')
    @ApiOperation({ summary: 'Get FAQs' })
    async getFAQs(@Query('category') category?: string) {
        return this.supportService.getFAQs(category);
    }

    @Post('faqs')
    @ApiOperation({ summary: 'Create FAQ' })
    async createFAQ(@Body() body: { question: string; answer: string; category: string; order?: number }) {
        return this.supportService.createFAQ(body.question, body.answer, body.category, body.order);
    }

    @Patch('faqs/:id')
    @ApiOperation({ summary: 'Update FAQ' })
    async updateFAQ(
        @Param('id') id: string,
        @Body() body: { question?: string; answer?: string; category?: string; order?: number },
    ) {
        return this.supportService.updateFAQ(id, body);
    }

    @Delete('faqs/:id')
    @ApiOperation({ summary: 'Delete FAQ' })
    async deleteFAQ(@Param('id') id: string) {
        return this.supportService.deleteFAQ(id);
    }
}
