import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Status, Prisma, ReportReason, ReportStatus, Role } from '@prisma/client';
import { CreditsService } from '../credits/credits.service';
import { SettingsService } from './settings.service';
import { AuditService } from './audit.service';

@Injectable()
export class AdminService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly creditsService: CreditsService,
        private readonly settingsService: SettingsService,
        private readonly auditService: AuditService,
    ) { }

    // ============ DASHBOARD ============

    // Get enhanced admin dashboard stats
    async getDashboardStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            totalUsers,
            activeUsers,
            premiumUsers,
            totalResources,
            hiddenResources,
            deletedResources,
            todayUploads,
            todayDownloads,
            aiRequests,
            pendingReports,
            totalRevenue,
            storageUsed,
        ] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.user.count({ where: { isActive: true } }),
            this.prisma.subscription.count({ where: { active: true } }),
            this.prisma.resource.count({ where: { isAutoDeleted: false } }),
            this.prisma.resource.count({ where: { isHidden: true, isAutoDeleted: false } }),
            this.prisma.resource.count({ where: { isAutoDeleted: true } }),
            this.prisma.resource.count({ where: { createdAt: { gte: today } } }),
            this.prisma.download.count({ where: { createdAt: { gte: today } } }),
            this.prisma.aIRequestLog.count({ where: { createdAt: { gte: today } } }).catch(() => 0),
            this.prisma.report.count({ where: { status: 'PENDING' } }),
            this.prisma.payment.aggregate({
                where: { status: 'captured' },
                _sum: { amount: true },
            }),
            this.prisma.resource.aggregate({
                where: { isAutoDeleted: false },
                _sum: { fileSize: true },
            }),
        ]);

        return {
            users: { total: totalUsers, active: activeUsers, premium: premiumUsers },
            resources: {
                total: totalResources,
                hidden: hiddenResources,
                deleted: deletedResources
            },
            today: { uploads: todayUploads, downloads: todayDownloads, aiRequests },
            moderation: { pendingReports },
            revenue: totalRevenue._sum.amount || 0,
            storageUsedMB: Math.round((storageUsed._sum.fileSize || 0) / (1024 * 1024)),
        };
    }

    // Get top reported resources for dashboard
    async getTopReportedResources(limit: number = 10) {
        return this.prisma.resource.findMany({
            where: {
                reportCount: { gt: 0 },
                isAutoDeleted: false
            },
            orderBy: { reportCount: 'desc' },
            take: limit,
            select: {
                id: true,
                title: true,
                reportCount: true,
                isHidden: true,
                author: { select: { id: true, name: true, email: true } },
                _count: { select: { reports: true } },
            },
        });
    }

    // ============ RESOURCES ============

    // Get all resources with enhanced filters
    async getAllResources(
        page: number = 1,
        limit: number = 20,
        status?: string, // 'all' | 'active' | 'hidden' | 'deleted'
        sortBy?: string, // 'newest' | 'oldest' | 'downloads' | 'views' | 'reports'
        search?: string,
        category?: string,
        subject?: string,
    ) {
        const skip = (page - 1) * limit;

        // Build where clause
        const where: Prisma.ResourceWhereInput = {};

        if (status === 'active') {
            where.isHidden = false;
            where.isAutoDeleted = false;
        } else if (status === 'hidden') {
            where.isHidden = true;
            where.isAutoDeleted = false;
        } else if (status === 'deleted') {
            where.isAutoDeleted = true;
        }
        // 'all' shows everything including deleted

        if (category) where.domain = category;
        if (subject) where.subject = subject;

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        // Build orderBy
        let orderBy: Prisma.ResourceOrderByWithRelationInput = { createdAt: 'desc' };
        switch (sortBy) {
            case 'oldest':
                orderBy = { createdAt: 'asc' };
                break;
            case 'downloads':
                orderBy = { downloadCount: 'desc' };
                break;
            case 'views':
                orderBy = { viewCount: 'desc' };
                break;
            case 'reports':
                orderBy = { reportCount: 'desc' };
                break;
        }

        const [resources, total] = await Promise.all([
            this.prisma.resource.findMany({
                where,
                orderBy,
                skip,
                take: limit,
                select: {
                    id: true,
                    title: true,
                    description: true,
                    fileType: true,
                    resourceType: true,
                    domain: true,
                    subDomain: true,
                    subject: true,
                    status: true,
                    viewCount: true,
                    downloadCount: true,
                    reportCount: true,
                    isHidden: true,
                    isAutoDeleted: true,
                    createdAt: true,
                    author: { select: { id: true, name: true, email: true } },
                },
            }),
            this.prisma.resource.count({ where }),
        ]);

        return { items: resources, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    // Get full resource details
    async getResourceById(resourceId: string) {
        const resource = await this.prisma.resource.findUnique({
            where: { id: resourceId },
            include: {
                author: {
                    select: { id: true, name: true, email: true, avatar: true },
                },
                reports: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                    include: { reporter: { select: { name: true, email: true } } },
                },
                _count: { select: { downloads: true, reports: true } },
            },
        });

        if (!resource) {
            throw new NotFoundException('Resource not found');
        }

        return resource;
    }

    // Restore resource (admin override)
    async restoreResource(id: string, adminId: string) {
        const resource = await this.prisma.resource.update({
            where: { id },
            data: { isHidden: false, isAutoDeleted: false, reportCount: 0 },
        });

        await this.auditService.logAction(adminId, 'RESTORE_RESOURCE', 'RESOURCE', id, { title: resource.title });
        return resource;
    }

    // Hide resource (manual moderation)
    async hideResource(id: string, adminId: string, reason: string) {
        const resource = await this.prisma.resource.update({
            where: { id },
            data: { isHidden: true },
        });

        await this.auditService.logAction(adminId, 'HIDE_RESOURCE', 'RESOURCE', id, { title: resource.title, reason });
        return resource;
    }

    // Archive (soft delete) resource
    async archiveResource(id: string, adminId: string) {
        const resource = await this.prisma.resource.update({
            where: { id },
            data: { isAutoDeleted: true, isHidden: true },
        });

        await this.auditService.logAction(adminId, 'ARCHIVE_RESOURCE', 'RESOURCE', id, { title: resource.title });
        return resource;
    }

    // Permanently delete resource
    async deleteResource(resourceId: string) {
        const resource = await this.prisma.resource.findUnique({ where: { id: resourceId } });
        if (!resource) throw new NotFoundException('Resource not found');

        await this.prisma.resource.delete({ where: { id: resourceId } });
        return { message: 'Resource deleted permanently' };
    }

    // Toggle resource visibility (legacy)
    async toggleResourcePrivate(resourceId: string) {
        const resource = await this.prisma.resource.findUnique({ where: { id: resourceId } });
        if (!resource) throw new NotFoundException('Resource not found');

        return this.prisma.resource.update({
            where: { id: resourceId },
            data: { isHidden: !resource.isHidden },
            select: { id: true, isHidden: true, status: true },
        });
    }

    // ============ REPORTS & MODERATION ============

    // Report a resource (called by users)
    async reportResource(resourceId: string, reason: ReportReason, description: string, reporterId: string) {
        const resource = await this.prisma.resource.findUnique({ where: { id: resourceId } });
        if (!resource) throw new NotFoundException('Resource not found');

        // Check if user already reported this resource
        const existingReport = await this.prisma.report.findFirst({
            where: { resourceId, reporterId },
        });
        if (existingReport) {
            throw new BadRequestException('You have already reported this resource');
        }

        // Create report
        const report = await this.prisma.report.create({
            data: {
                resourceId,
                reason,
                description,
                reporterId,
                status: 'PENDING'
            },
        });

        // Increment report count
        const updated = await this.prisma.resource.update({
            where: { id: resourceId },
            data: { reportCount: { increment: 1 } },
        });

        // Get thresholds from settings
        const hideThreshold = await this.settingsService.getSetting('report_hide_threshold', 5);
        const deleteThreshold = await this.settingsService.getSetting('report_delete_threshold', 10);

        // Auto-moderation logic
        if (updated.reportCount >= deleteThreshold) {
            await this.prisma.resource.update({
                where: { id: resourceId },
                data: { isAutoDeleted: true, isHidden: true },
            });
            await this.auditService.logAction('SYSTEM', 'AUTO_DELETE_RESOURCE', 'RESOURCE', resourceId, {
                title: resource.title,
                reason: 'Report threshold exceeded'
            });
            return { action: 'auto_deleted', reportCount: updated.reportCount };
        } else if (updated.reportCount >= hideThreshold && !updated.isHidden) {
            await this.prisma.resource.update({
                where: { id: resourceId },
                data: { isHidden: true },
            });
            await this.auditService.logAction('SYSTEM', 'AUTO_HIDE_RESOURCE', 'RESOURCE', resourceId, {
                title: resource.title,
                reason: 'Report threshold exceeded'
            });
            return { action: 'auto_hidden', reportCount: updated.reportCount };
        }

        return { action: 'reported', reportCount: updated.reportCount };
    }

    // Get moderation stats
    async getModerationStats() {
        const [pendingReports, autoHidden, autoDeleted] = await Promise.all([
            this.prisma.report.count({ where: { status: 'PENDING' } }),
            this.prisma.resource.count({ where: { isHidden: true, isAutoDeleted: false } }),
            this.prisma.resource.count({ where: { isAutoDeleted: true } }),
        ]);

        return { pendingReports, autoHidden, autoDeleted };
    }

    // Get reported resources
    async getReportedResources(page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;

        const [resources, total] = await Promise.all([
            this.prisma.resource.findMany({
                where: { reportCount: { gt: 0 } },
                orderBy: { reportCount: 'desc' },
                skip,
                take: limit,
                include: {
                    author: { select: { id: true, name: true, email: true } },
                    reports: {
                        orderBy: { createdAt: 'desc' },
                        take: 5,
                        include: { reporter: { select: { name: true } } },
                    },
                },
            }),
            this.prisma.resource.count({ where: { reportCount: { gt: 0 } } }),
        ]);

        return { items: resources, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    // ============ USERS ============

    // Get all users with enhanced filters
    async getUsers(
        page: number = 1,
        limit: number = 20,
        search?: string,
        role?: string, // 'all' | 'user' | 'admin' | 'premium'
        status?: string, // 'all' | 'active' | 'suspended'
    ) {
        const skip = (page - 1) * limit;

        const where: Prisma.UserWhereInput = {};

        if (role === 'premium') {
            where.subscription = { active: true };
        } else if (role === 'admin') {
            where.role = 'ADMIN';
        } else if (role === 'user') {
            where.role = 'USER';
        }

        if (status === 'active') where.isActive = true;
        else if (status === 'suspended') where.isActive = false;

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    dailyCredits: true,
                    uploadCredits: true,
                    isActive: true,
                    subscription: {
                        select: {
                            plan: { select: { id: true, name: true } },
                            active: true,
                            endDate: true,
                        }
                    },
                    createdAt: true,
                    _count: { select: { uploads: true, downloads: true, reportsMade: true } },
                },
            }),
            this.prisma.user.count({ where }),
        ]);

        return { items: users, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    // Get user details with activity
    async getUserDetails(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                subscription: { include: { plan: true } },
                uploads: { orderBy: { createdAt: 'desc' }, take: 10 },
                downloads: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                    include: { resource: { select: { title: true } } }
                },
                _count: { select: { uploads: true, downloads: true, reportsMade: true } },
            },
        });

        if (!user) throw new NotFoundException('User not found');

        const aiUsage = await this.prisma.aIRequestLog.count({ where: { userId } }).catch(() => 0);

        return { ...user, aiUsage };
    }

    // Suspend user
    async suspendUser(userId: string, adminId: string) {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: { isActive: false },
        });
        await this.auditService.logAction(adminId, 'SUSPEND_USER', 'USER', userId, { email: user.email });
        return user;
    }

    // Promote user to premium (admin action)
    async promoteToPremium(userId: string, adminId: string) {
        // Complex logic: Create a free premium subscription or similar
        // For now just logged
        await this.auditService.logAction(adminId, 'PROMOTE_USER', 'USER', userId, {});
        // Actual implementation would involve SubscriptionService
        return { success: true };
    }

    // Adjust user credits
    async adjustCredits(userId: string, amount: number, type: 'daily' | 'upload') {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        const data = type === 'daily'
            ? { dailyCredits: { increment: amount } }
            : { uploadCredits: { increment: amount } };

        return this.prisma.user.update({
            where: { id: userId },
            data,
            select: { id: true, dailyCredits: true, uploadCredits: true },
        });
    }

    // Upgrade user subscription
    async upgradeSubscription(userId: string, planId: string, durationMonths: number = 1) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
        if (!plan) throw new NotFoundException('Plan not found');

        const endDate = new Date();
        if (plan.interval === 'LIFETIME') {
            endDate.setFullYear(endDate.getFullYear() + 100);
        } else if (plan.interval === 'YEARLY') {
            endDate.setFullYear(endDate.getFullYear() + 1);
        } else {
            endDate.setMonth(endDate.getMonth() + durationMonths);
        }

        const subscription = await this.prisma.subscription.upsert({
            where: { userId },
            update: { planId, endDate, active: true, startDate: new Date() },
            create: { userId, planId, endDate, active: true },
            include: { plan: true },
        });

        return subscription;
    }
}



