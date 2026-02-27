import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Status, Prisma } from '@prisma/client';

@Injectable()
export class ResourcesService {
    constructor(private readonly prisma: PrismaService) { }

    // Get paginated resources with filters
    async findAll(query: {
        page?: number;
        limit?: number;
        domain?: string;
        subDomain?: string;
        subject?: string;
        resourceType?: string;
        category?: string;
        status?: Status;
        search?: string;
        sortBy?: 'latest' | 'popular' | 'downloads';
    }) {
        const { page = 1, limit = 12, domain, subDomain, subject, resourceType, category, status, search, sortBy = 'latest' } = query;
        const skip = (page - 1) * limit;

        const where: Prisma.ResourceWhereInput = {
            status: status || 'APPROVED',
            ...(category && { category: category as any }),
            ...(domain && { domain }),
            ...(subDomain && { subDomain }),
            ...(subject && { subject }),
            ...(resourceType && { resourceType: resourceType as any }),
            ...(search && {
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                    { subject: { contains: search, mode: 'insensitive' } },
                    { tags: { has: search } },
                ],
            }),
        };

        const orderBy: Prisma.ResourceOrderByWithRelationInput =
            sortBy === 'popular' ? { viewCount: 'desc' } :
                sortBy === 'downloads' ? { downloadCount: 'desc' } :
                    { createdAt: 'desc' };

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
                    thumbnailUrl: true,
                    domain: true,
                    subDomain: true,
                    subject: true,
                    resourceType: true,
                    category: true,
                    tags: true,
                    viewCount: true,
                    downloadCount: true,
                    createdAt: true,
                    author: {
                        select: { id: true, name: true, avatar: true },
                    },
                },
            }),
            this.prisma.resource.count({ where }),
        ]);

        return {
            items: resources,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    // Get single resource by ID
    async findOne(id: string) {
        const resource = await this.prisma.resource.findUnique({
            where: { id },
            include: {
                author: {
                    select: { id: true, name: true, avatar: true },
                },
            },
        });

        if (!resource) {
            throw new NotFoundException('Resource not found');
        }

        // Increment view count
        await this.prisma.resource.update({
            where: { id },
            data: { viewCount: { increment: 1 } },
        });

        return resource;
    }

    // Create new resource
    async create(userId: string, data: {
        title: string;
        description: string;
        fileUrl: string;
        fileHash: string;
        fileSize: number;
        fileType: string;
        thumbnailUrl?: string;
        domain: string;
        subDomain: string;
        stream?: string;
        subject: string;
        resourceType: string;
        tags?: string[];
        // New polymorphic fields
        category?: string;
        metadata?: Record<string, unknown>;
    }) {
        // Check for duplicate file
        const existing = await this.prisma.resource.findUnique({
            where: { fileHash: data.fileHash },
        });

        if (existing) {
            throw new BadRequestException('This file has already been uploaded');
        }

        return this.prisma.resource.create({
            data: {
                title: data.title,
                description: data.description,
                fileUrl: data.fileUrl,
                fileHash: data.fileHash,
                fileSize: data.fileSize,
                fileType: data.fileType as any,
                thumbnailUrl: data.thumbnailUrl,
                domain: data.domain,
                subDomain: data.subDomain,
                stream: data.stream,
                subject: data.subject,
                resourceType: data.resourceType as any,
                tags: data.tags || [],
                category: (data.category || 'ACADEMIC') as any,
                metadata: (data.metadata || {}) as Prisma.InputJsonValue,
                status: 'APPROVED', // Auto-approve for better UX during testing
                authorId: userId,
            },
            include: {
                author: {
                    select: { id: true, name: true, avatar: true },
                },
            },
        });
    }

    // Update resource
    async update(id: string, userId: string, data: Partial<{
        title: string;
        description: string;
        tags: string[];
    }>) {
        const resource = await this.prisma.resource.findUnique({ where: { id } });

        if (!resource) {
            throw new NotFoundException('Resource not found');
        }

        if (resource.authorId !== userId) {
            throw new ForbiddenException('You can only edit your own resources');
        }

        return this.prisma.resource.update({
            where: { id },
            data,
        });
    }

    // Delete resource
    async delete(id: string, userId: string, isAdmin: boolean = false) {
        const resource = await this.prisma.resource.findUnique({ where: { id } });

        if (!resource) {
            throw new NotFoundException('Resource not found');
        }

        if (!isAdmin && resource.authorId !== userId) {
            throw new ForbiddenException('You can only delete your own resources');
        }

        await this.prisma.resource.delete({ where: { id } });
        return { message: 'Resource deleted successfully' };
    }

    // Get featured resources
    async getFeatured(limit: number = 6) {
        return this.prisma.resource.findMany({
            where: { status: 'APPROVED' },
            orderBy: { downloadCount: 'desc' },
            take: limit,
            select: {
                id: true,
                title: true,
                fileType: true,
                thumbnailUrl: true,
                subject: true,
                resourceType: true,
                downloadCount: true,
                viewCount: true,
                author: {
                    select: { id: true, name: true },
                },
            },
        });
    }

    // Get trending resources
    async getTrending(limit: number = 6) {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        return this.prisma.resource.findMany({
            where: {
                status: 'APPROVED',
                createdAt: { gte: oneWeekAgo },
            },
            orderBy: { viewCount: 'desc' },
            take: limit,
            select: {
                id: true,
                title: true,
                fileType: true,
                thumbnailUrl: true,
                subject: true,
                resourceType: true,
                downloadCount: true,
                viewCount: true,
                author: {
                    select: { id: true, name: true },
                },
            },
        });
    }

    // Get user's uploads
    async getUserUploads(userId: string) {
        return this.prisma.resource.findMany({
            where: { authorId: userId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                title: true,
                fileType: true,
                thumbnailUrl: true,
                status: true,
                resourceType: true,
                downloadCount: true,
                createdAt: true,
                author: {
                    select: { id: true, name: true, avatar: true },
                },
            },
        });
    }
}
