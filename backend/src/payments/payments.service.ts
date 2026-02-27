import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Razorpay = require('razorpay');
import * as crypto from 'crypto';
import { BillingInterval } from '@prisma/client';

@Injectable()
export class PaymentsService {
    private razorpay: any;

    constructor(private readonly prisma: PrismaService) {
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            console.warn('Razorpay keys are missing in environment variables');
        }

        this.razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || '',
            key_secret: process.env.RAZORPAY_KEY_SECRET || '',
        });
    }

    async createOrder(userId: string, planId: string) {
        // Fetch plan from DB to get accurate price
        const plan = await this.prisma.plan.findUnique({ where: { id: planId } });

        if (!plan) {
            throw new NotFoundException(`Plan with ID ${planId} not found`);
        }

        const amount = Math.round(plan.price * 100); // Convert to paise

        try {
            const options = {
                amount: amount,
                currency: plan.currency,
                receipt: `r_${Date.now()}`,
                notes: { userId, planId },
            };

            const order = await this.razorpay.orders.create(options);

            // Create Payment record
            await this.prisma.payment.create({
                data: {
                    userId,
                    orderId: order.id,
                    amount: plan.price,
                    currency: plan.currency,
                    status: 'CREATED',
                    planId: plan.id,
                },
            });

            return {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                key: process.env.RAZORPAY_KEY_ID,
            };
        } catch (error) {
            console.error('Razorpay Order Creation Error:', error);
            throw new InternalServerErrorException('Failed to create payment order');
        }
    }

    async verifyPayment(userId: string, orderId: string, paymentId: string, signature: string, planId: string) {
        const generated_signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
            .update(orderId + '|' + paymentId)
            .digest('hex');

        if (generated_signature !== signature) {
            await this.prisma.payment.update({
                where: { orderId },
                data: { status: 'FAILED' },
            });
            throw new BadRequestException('Invalid payment signature');
        }

        const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
        if (!plan) throw new NotFoundException('Plan not found for verification');

        // Update Payment status
        await this.prisma.payment.update({
            where: { orderId },
            data: {
                status: 'SUCCESS',
                paymentId: paymentId,
                signature: signature,
            },
        });

        // Calculate subscription dates
        const startDate = new Date();
        const endDate = new Date();

        if (plan.interval === BillingInterval.MONTHLY) {
            endDate.setMonth(endDate.getMonth() + 1);
        } else if (plan.interval === BillingInterval.YEARLY) {
            endDate.setFullYear(endDate.getFullYear() + 1);
        } else if (plan.interval === BillingInterval.LIFETIME) {
            endDate.setFullYear(endDate.getFullYear() + 100);
        }

        // Deactivate old active subscriptions
        await this.prisma.subscription.updateMany({
            where: { userId, active: true },
            data: { active: false },
        });

        // Create new subscription
        await this.prisma.subscription.create({
            data: {
                userId,
                planId: plan.id,
                startDate,
                endDate,
                active: true,
            },
        });

        // Update User Credits (Example logic - refine as needed)
        // Usually credits are refreshed daily via cron based on active subscription,
        // but valid to give instant boost.
        if (plan.interval === BillingInterval.MONTHLY) {
            await this.prisma.user.update({
                where: { id: userId },
                data: { dailyCredits: 50 },
            });
        }

        return { success: true };
    }
}
