import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
    constructor(private prisma: PrismaService) { }

    async logAction(adminId: string, action: string, targetType: string, targetId?: string, details?: any, ipAddress?: string) {
        return this.prisma.auditLog.create({
            data: {
                adminId,
                action,
                targetType,
                targetId,
                details: details ? JSON.parse(JSON.stringify(details)) : undefined, // Ensure it's JSON compatible
                ipAddress,
            },
        });
    }

    async getLogs(limit = 50, offset = 0, action?: string, adminId?: string) {
        const where: any = {};
        if (action) where.action = action;
        if (adminId) where.adminId = adminId;

        const [logs, total] = await Promise.all([
            this.prisma.auditLog.findMany({
                where,
                include: {
                    admin: {
                        select: { id: true, name: true, email: true, role: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset,
            }),
            this.prisma.auditLog.count({ where }),
        ]);

        return { logs, total };
    }
}
