import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MonetizationService {
    constructor(private readonly prisma: PrismaService) { }

    // ============ CONFIGURATION ============

    async getAllConfigs() {
        return this.prisma.adConfig.findMany({
            orderBy: { placement: 'asc' }
        });
    }

    async updateConfig(id: string, data: {
        enabled?: boolean;
        adUnitId?: string;
        settings?: any;
    }) {
        return this.prisma.adConfig.update({
            where: { id },
            data
        });
    }

    // ============ STATS ============

    async getStats(days: number = 7) {
        const date = new Date();
        date.setDate(date.getDate() - days);

        const [impressions, revenue, byPlacement] = await Promise.all([
            this.prisma.adImpression.count({
                where: { createdAt: { gte: date } }
            }),
            this.prisma.adImpression.aggregate({
                where: { createdAt: { gte: date } },
                _sum: { revenue: true }
            }),
            this.prisma.adImpression.groupBy({
                by: ['placement'],
                where: { createdAt: { gte: date } },
                _count: { _all: true },
                _sum: { revenue: true }
            })
        ]);

        return {
            totalImpressions: impressions,
            totalRevenue: revenue._sum.revenue || 0,
            byPlacement: byPlacement.map(p => ({
                placement: p.placement,
                impressions: p._count._all,
                revenue: p._sum.revenue || 0
            }))
        };
    }
}
