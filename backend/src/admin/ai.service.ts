import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AIAdminService {
    constructor(private readonly prisma: PrismaService) { }

    // ============ CONFIGURATION ============

    async getAllConfigs() {
        return this.prisma.aIConfig.findMany({
            orderBy: { featureKey: 'asc' }
        });
    }

    async updateConfig(featureKey: string, data: {
        enabled?: boolean;
        dailyLimit?: number;
        premiumOnly?: boolean;
        settings?: any;
    }) {
        const config = await this.prisma.aIConfig.findUnique({ where: { featureKey } });

        if (!config) {
            // Auto-create if not exists (lazy init)
            // But we need name usually. For now, try update, if fails, throw.
            // Or better, creating default configs should be a seed script.
            // Here we assume they exist or we upsert.
            return this.prisma.aIConfig.upsert({
                where: { featureKey },
                update: data,
                create: {
                    featureKey,
                    name: featureKey.charAt(0).toUpperCase() + featureKey.slice(1), // Fallback name
                    ...data
                }
            });
        }

        return this.prisma.aIConfig.update({
            where: { featureKey },
            data
        });
    }

    // ============ STATS & LOGS ============

    async getStats(days: number = 7) {
        const date = new Date();
        date.setDate(date.getDate() - days);

        const [totalRequests, errors, byFeature] = await Promise.all([
            this.prisma.aIRequestLog.count({
                where: { createdAt: { gte: date } }
            }),
            this.prisma.aIRequestLog.count({
                where: {
                    createdAt: { gte: date },
                    success: false
                }
            }),
            this.prisma.aIRequestLog.groupBy({
                by: ['featureKey'],
                where: { createdAt: { gte: date } },
                _count: { _all: true }
            })
        ]);

        return {
            totalRequests,
            errorRate: totalRequests > 0 ? (errors / totalRequests) * 100 : 0,
            byFeature: byFeature.map(f => ({ feature: f.featureKey, count: f._count._all }))
        };
    }

    async getLogs(limit: number = 20, featureKey?: string) {
        return this.prisma.aIRequestLog.findMany({
            where: featureKey ? { featureKey } : undefined,
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: {
                user: { select: { name: true, email: true } }
            }
        });
    }
}
