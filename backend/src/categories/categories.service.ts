import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
    constructor(private readonly prisma: PrismaService) { }

    // Get all domains with subdomains
    async getDomains() {
        return this.prisma.domain.findMany({
            include: {
                subDomains: {
                    include: {
                        streams: {
                            include: {
                                subjects: true,
                            },
                        },
                    },
                },
            },
            orderBy: { name: 'asc' },
        });
    }

    // Get subdomains for a specific domain
    async getSubDomains(domainId: string) {
        return this.prisma.subDomain.findMany({
            where: { domainId },
            include: {
                streams: {
                    include: {
                        subjects: true,
                    },
                },
            },
            orderBy: { name: 'asc' },
        });
    }

    // Get platform stats
    async getStats() {
        const [totalResources, totalUsers, totalDownloads, categories] = await Promise.all([
            this.prisma.resource.count({ where: { status: 'APPROVED' } }),
            this.prisma.user.count({ where: { isActive: true } }),
            this.prisma.download.count(),
            this.prisma.domain.count(),
        ]);

        return {
            totalResources,
            totalUsers,
            totalDownloads,
            categories,
        };
    }

    // Seed initial categories (for development)
    async seedCategories() {
        const domains = [
            {
                name: 'Engineering',
                slug: 'engineering',
                subDomains: [
                    { name: 'Computer Science', slug: 'cs', streams: ['B.Tech', 'M.Tech'] },
                    { name: 'Electronics', slug: 'ece', streams: ['B.Tech', 'M.Tech'] },
                    { name: 'Mechanical', slug: 'mech', streams: ['B.Tech', 'M.Tech'] },
                ],
            },
            {
                name: 'Medical',
                slug: 'medical',
                subDomains: [
                    { name: 'MBBS', slug: 'mbbs', streams: [] },
                    { name: 'Nursing', slug: 'nursing', streams: [] },
                    { name: 'Pharmacy', slug: 'pharmacy', streams: ['B.Pharm', 'M.Pharm'] },
                ],
            },
            {
                name: 'Commerce',
                slug: 'commerce',
                subDomains: [
                    { name: 'Accounting', slug: 'accounting', streams: ['B.Com', 'M.Com'] },
                    { name: 'Finance', slug: 'finance', streams: ['BBA', 'MBA'] },
                ],
            },
            {
                name: 'Science',
                slug: 'science',
                subDomains: [
                    { name: 'Physics', slug: 'physics', streams: ['B.Sc', 'M.Sc'] },
                    { name: 'Chemistry', slug: 'chemistry', streams: ['B.Sc', 'M.Sc'] },
                    { name: 'Mathematics', slug: 'mathematics', streams: ['B.Sc', 'M.Sc'] },
                ],
            },
        ];

        for (const domain of domains) {
            await this.prisma.domain.upsert({
                where: { slug: domain.slug },
                update: {},
                create: {
                    name: domain.name,
                    slug: domain.slug,
                    subDomains: {
                        create: domain.subDomains.map((sd) => ({
                            name: sd.name,
                            slug: sd.slug,
                            streams: sd.streams.length > 0
                                ? {
                                    create: sd.streams.map((stream) => ({
                                        name: stream,
                                        slug: stream.toLowerCase().replace(/\./g, ''),
                                        subjects: {
                                            create: [
                                                { name: 'General Studies', slug: 'general' },
                                            ],
                                        },
                                    })),
                                }
                                : undefined,
                        })),
                    },
                },
            });
        }

        return { message: 'Categories seeded successfully' };
    }
}
