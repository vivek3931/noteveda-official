import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
    constructor(private prisma: PrismaService) { }

    async createAnnouncement(title: string, message: string, type: string, target: string, expiresAt?: Date) {
        return this.prisma.announcement.create({
            data: {
                title,
                message,
                type,
                target,
                expiresAt,
                isActive: true,
            },
        });
    }

    async getAnnouncements(activeOnly = false) {
        const where = activeOnly ? { isActive: true } : {};
        return this.prisma.announcement.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
    }

    async deleteAnnouncement(id: string) {
        return this.prisma.announcement.delete({
            where: { id },
        });
    }

    async toggleAnnouncementStatus(id: string, isActive: boolean) {
        return this.prisma.announcement.update({
            where: { id },
            data: { isActive },
        });
    }
}
