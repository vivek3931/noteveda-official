import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BillingInterval } from '@prisma/client';

@Injectable()
export class PremiumService {
    constructor(private readonly prisma: PrismaService) { }

    // ============ PLANS ============

    async getPlans() {
        return this.prisma.plan.findMany({
            orderBy: { price: 'asc' }
        });
    }

    async createPlan(data: {
        name: string;
        description: string;
        price: number;
        interval: BillingInterval;
        features: string[];
        badge?: string;
        highlighted?: boolean;
        cta: string;
        ctaLink: string;
    }) {
        return this.prisma.plan.create({ data });
    }

    async updatePlan(id: string, data: {
        name?: string;
        description?: string;
        price?: number;
        features?: string[];
        isActive?: boolean;
    }) {
        return this.prisma.plan.update({
            where: { id },
            data
        });
    }

    // ============ SUBSCRIPTIONS ============

    async getPremiumUsers(params: { page?: number; limit?: number; search?: string }) {
        const page = params.page || 1;
        const limit = params.limit || 10;
        const skip = (page - 1) * limit;

        const where: any = {
            subscription: {
                active: true
            }
        };

        if (params.search) {
            where.OR = [
                { name: { contains: params.search, mode: 'insensitive' } },
                { email: { contains: params.search, mode: 'insensitive' } },
            ];
        }

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                include: {
                    subscription: {
                        include: { plan: true }
                    }
                },
                skip,
                take: limit,
                orderBy: { subscription: { startDate: 'desc' } }
            }),
            this.prisma.user.count({ where })
        ]);

        return {
            users: users.map(u => ({
                id: u.id,
                name: u.name,
                email: u.email,
                avatar: u.avatar,
                plan: u.subscription?.plan?.name,
                since: u.subscription?.startDate,
                status: u.isActive ? 'Active' : 'Blocked'
            })),
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }
}
