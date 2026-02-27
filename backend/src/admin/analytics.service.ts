import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
    constructor(private readonly prisma: PrismaService) { }

    async getGrowthMetrics() {
        // Get user registrations for the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const users = await this.prisma.user.findMany({
            where: { createdAt: { gte: thirtyDaysAgo } },
            select: { createdAt: true },
        });

        // Group by date
        const dailyGrowth = users.reduce((acc, user) => {
            const date = user.createdAt.toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Fill in missing dates
        const result = [];
        for (let i = 0; i < 30; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            result.push({ date: dateStr, count: dailyGrowth[dateStr] || 0 });
        }

        return result.reverse();
    }

    async getContentMetrics() {
        const topDownloads = await this.prisma.resource.findMany({
            orderBy: { downloadCount: 'desc' },
            take: 5,
            select: { id: true, title: true, downloadCount: true, domain: true },
        });

        const trendingSubjects = await this.prisma.resource.groupBy({
            by: ['subject'],
            _count: { subject: true },
            orderBy: { _count: { subject: 'desc' } },
            take: 5,
        });

        return { topDownloads, trendingSubjects };
    }

    async getActivityMetrics() {
        // Mock activity data for now as we don't handle granular login logging yet
        // In a real app, this would query a Session or ActivityLog table
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        return days.map(day => ({
            day,
            active: Math.floor(Math.random() * 50) + 10, // Randomized mock data
        }));
    }
}
