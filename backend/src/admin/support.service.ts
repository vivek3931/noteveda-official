import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TicketStatus, TicketPriority } from '@prisma/client';

@Injectable()
export class SupportService {
    constructor(private prisma: PrismaService) { }

    // Tickets
    async getTickets(status?: TicketStatus, priority?: TicketPriority) {
        const where: any = {};
        if (status) where.status = status;
        if (priority) where.priority = priority;

        return this.prisma.supportTicket.findMany({
            where,
            include: {
                user: { select: { id: true, name: true, email: true, avatar: true } },
                messages: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getTicket(id: string) {
        return this.prisma.supportTicket.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, name: true, email: true, avatar: true } },
                messages: {
                    include: {
                        sender: { select: { id: true, name: true, role: true } },
                    },
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
    }

    async updateTicketStatus(id: string, status: TicketStatus) {
        return this.prisma.supportTicket.update({
            where: { id },
            data: { status },
        });
    }

    async replyToTicket(ticketId: string, senderId: string, message: string) {
        // Create message
        const msg = await this.prisma.ticketMessage.create({
            data: {
                ticketId,
                senderId,
                message,
                isAdmin: true, // Mark as admin reply
            },
        });

        // Update ticket updated at and potentially status
        await this.prisma.supportTicket.update({
            where: { id: ticketId },
            data: {
                updatedAt: new Date(),
                status: TicketStatus.IN_PROGRESS, // Auto-set to IN_PROGRESS on reply
            },
        });

        return msg;
    }

    // FAQs
    async getFAQs(category?: string) {
        const where = category ? { category } : {};
        return this.prisma.fAQ.findMany({
            where,
            orderBy: { order: 'asc' },
        });
    }

    async createFAQ(question: string, answer: string, category: string, order?: number) {
        return this.prisma.fAQ.create({
            data: { question, answer, category, order: order || 0 },
        });
    }

    async updateFAQ(id: string, data: { question?: string; answer?: string; category?: string; order?: number }) {
        return this.prisma.fAQ.update({
            where: { id },
            data,
        });
    }

    async deleteFAQ(id: string) {
        return this.prisma.fAQ.delete({
            where: { id },
        });
    }
}
