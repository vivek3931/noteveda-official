import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BillingInterval } from '@prisma/client';

@Injectable()
export class CreditsService {
    constructor(private readonly prisma: PrismaService) { }

    // Get user credits
    async getCredits(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                dailyCredits: true,
                uploadCredits: true,
                lastCreditReset: true,
                subscription: {
                    select: { active: true, plan: true },
                },
            },
        });

        return {
            dailyCredits: user?.dailyCredits || 0,
            uploadCredits: user?.uploadCredits || 0,
            totalCredits: (user?.dailyCredits || 0) + (user?.uploadCredits || 0),
            isPro: user?.subscription?.active || false,
            lastReset: user?.lastCreditReset,
        };
    }

    // Deduct credit for download
    async deductCredit(userId: string): Promise<boolean> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                subscription: {
                    include: { plan: true }
                }
            },
        });

        if (!user) {
            throw new BadRequestException('User not found');
        }

        // Pro Yearly users have unlimited downloads
        if (user.subscription?.active && user.subscription.plan?.interval === BillingInterval.YEARLY) {
            return true;
        }

        // Try daily credits first
        if (user.dailyCredits > 0) {
            await this.prisma.user.update({
                where: { id: userId },
                data: { dailyCredits: { decrement: 1 } },
            });
            return true;
        }

        // Then try upload credits
        if (user.uploadCredits > 0) {
            await this.prisma.user.update({
                where: { id: userId },
                data: { uploadCredits: { decrement: 1 } },
            });
            return true;
        }

        // No credits available
        return false;
    }

    // Award upload credit when resource is approved
    async awardUploadCredit(userId: string, amount: number = 1) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { uploadCredits: { increment: amount } },
        });
    }

    // Download resource with credit deduction
    async downloadResource(userId: string, resourceId: string) {
        // Check if already downloaded
        const existingDownload = await this.prisma.download.findUnique({
            where: {
                userId_resourceId: { userId, resourceId },
            },
        });

        if (existingDownload) {
            // Already downloaded, no credit needed
            const resource = await this.prisma.resource.findUnique({
                where: { id: resourceId },
                select: { fileUrl: true },
            });
            return { fileUrl: resource?.fileUrl, alreadyDownloaded: true };
        }

        // Check if user has credits
        const hasCredits = await this.deductCredit(userId);
        if (!hasCredits) {
            throw new BadRequestException('Insufficient credits. Upload resources or upgrade to Pro.');
        }

        // Record download
        await this.prisma.download.create({
            data: { userId, resourceId },
        });

        // Increment download count
        const resource = await this.prisma.resource.update({
            where: { id: resourceId },
            data: { downloadCount: { increment: 1 } },
            select: { fileUrl: true },
        });

        return { fileUrl: resource.fileUrl, alreadyDownloaded: false };
    }

    // Get user download history
    async getDownloadHistory(userId: string) {
        return this.prisma.download.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                resource: {
                    select: {
                        id: true,
                        title: true,
                        fileType: true,
                        subject: true,
                        resourceType: true,
                    },
                },
            },
        });
    }

    // Cron job: Reset daily credits at midnight
    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async resetDailyCredits() {
        console.log('Resetting daily credits for all users...');

        const result = await this.prisma.user.updateMany({
            where: {
                role: 'USER',
                subscription: null, // Only free users
            },
            data: {
                dailyCredits: 5,
                lastCreditReset: new Date(),
            },
        });

        console.log(`Reset daily credits for ${result.count} users`);
    }
}
