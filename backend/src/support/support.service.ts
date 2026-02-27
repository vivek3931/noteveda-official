import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Status, TicketPriority, TicketStatus } from '@prisma/client';

@Injectable()
export class SupportService {
    constructor(private prisma: PrismaService) { }

    // Create a ticket
    async createTicket(userId: string, subject: string, message: string, priority: TicketPriority = 'NORMAL') {
        return this.prisma.supportTicket.create({
            data: {
                userId,
                subject,
                priority,
                status: 'OPEN',
                messages: {
                    create: {
                        senderId: userId,
                        message,
                        isAdmin: false
                    }
                }
            },
            include: { messages: true }
        });
    }

    // Get user's own tickets
    async getUserTickets(userId: string) {
        return this.prisma.supportTicket.findMany({
            where: { userId },
            include: { messages: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    // Get single ticket (verify ownership)
    async getTicket(userId: string, ticketId: string) {
        const ticket = await this.prisma.supportTicket.findUnique({
            where: { id: ticketId },
            include: { messages: { include: { sender: { select: { id: true, name: true, role: true } } } } },
        });

        if (!ticket || ticket.userId !== userId) {
            throw new BadRequestException('Ticket not found or access denied');
        }

        return ticket;
    }

    // Reply to ticket (user side)
    async replyToTicket(userId: string, ticketId: string, message: string) {
        const ticket = await this.getTicket(userId, ticketId); // Verifies ownership

        const msg = await this.prisma.ticketMessage.create({
            data: {
                ticketId,
                senderId: userId,
                message,
                isAdmin: false,
            },
        });

        // Re-open ticket if it was resolved/closed
        if (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') {
            await this.prisma.supportTicket.update({
                where: { id: ticketId },
                data: { status: 'OPEN', updatedAt: new Date() },
            });
        }

        return msg;
    }

    // Get active FAQs
    async getFAQs(category?: string) {
        const where: any = { isActive: true };
        if (category) where.category = category;

        return this.prisma.fAQ.findMany({
            where,
            orderBy: { order: 'asc' },
        });
    }
}
