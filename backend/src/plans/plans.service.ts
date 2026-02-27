import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PlansService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.plan.findMany({
            where: { isActive: true },
            orderBy: { price: 'asc' },
        });
    }

    async seedPlans() {
        const count = await this.prisma.plan.count();
        if (count > 0) return { message: 'Plans already exist' };

        const plans = [
            {
                name: 'Free',
                description: 'Essential tools for casual learners',
                price: 0,
                currency: 'INR',
                interval: 'MONTHLY', // Dummy interval for free
                features: ['5 Daily Downloads', 'Basic Search', 'Community Support'],
                cta: 'Get Started',
                ctaLink: '/register',
                isActive: true,
            },
            {
                name: 'Pro Monthly',
                description: 'Power up your study routine',
                price: 149,
                currency: 'INR',
                interval: 'MONTHLY',
                features: [
                    '50 Daily Downloads',
                    'Priority Search',
                    'Ad-free Experience',
                    'Premium resources access',
                    'Email Support',
                ],
                highlighted: true,
                badge: 'Most Popular',
                cta: 'Subscribe Now',
                ctaLink: '#', // Handled by button
                isActive: true,
            },
            {
                name: 'Pro Yearly',
                description: 'Maximum value for serious students',
                price: 1499,
                currency: 'INR',
                interval: 'YEARLY',
                features: [
                    'Unlimited Downloads',
                    'All Pro features',
                    '2 months free',
                    'Early access to new features',
                    'Priority Support',
                ],
                cta: 'Subscribe Now',
                ctaLink: '#',
                isActive: true,
            },
        ];

        for (const plan of plans) {
            await this.prisma.plan.create({
                data: {
                    ...plan,
                    interval: plan.interval as any, // Cast to match Enum
                },
            });
        }

        return { message: 'Plans seeded successfully' };
    }
}
