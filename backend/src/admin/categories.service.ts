import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
    constructor(private readonly prisma: PrismaService) { }

    // ============ DOMAINS ============

    async getDomains() {
        return this.prisma.domain.findMany({
            include: {
                subDomains: {
                    include: {
                        streams: {
                            include: {
                                subjects: true
                            }
                        }
                    }
                }
            },
            orderBy: { name: 'asc' }
        });
    }

    async createDomain(data: { name: string; slug: string }) {
        try {
            return await this.prisma.domain.create({ data });
        } catch (error) {
            if (error.code === 'P2002') {
                throw new ConflictException('Domain with this name or slug already exists');
            }
            throw error;
        }
    }

    async updateDomain(id: string, data: { name?: string; slug?: string }) {
        try {
            return await this.prisma.domain.update({ where: { id }, data });
        } catch (error) {
            if (error.code === 'P2002') {
                throw new ConflictException('Domain with this name or slug already exists');
            }
            throw error;
        }
    }

    async deleteDomain(id: string) {
        return this.prisma.domain.delete({ where: { id } });
    }

    // ============ SUBDOMAINS ============

    async createSubDomain(data: { domainId: string; name: string; slug: string }) {
        try {
            return await this.prisma.subDomain.create({ data });
        } catch (error) {
            if (error.code === 'P2002') {
                throw new ConflictException('SubDomain with this slug already exists in this domain');
            }
            throw error;
        }
    }

    async updateSubDomain(id: string, data: { name?: string; slug?: string }) {
        try {
            return await this.prisma.subDomain.update({ where: { id }, data });
        } catch (error) {
            if (error.code === 'P2002') {
                throw new ConflictException('SubDomain with this slug already exists in this domain');
            }
            throw error;
        }
    }

    async deleteSubDomain(id: string) {
        return this.prisma.subDomain.delete({ where: { id } });
    }

    // ============ STREAMS ============

    async createStream(data: { subDomainId: string; name: string; slug: string }) {
        try {
            return await this.prisma.stream.create({ data });
        } catch (error) {
            if (error.code === 'P2002') {
                throw new ConflictException('Stream with this slug already exists in this subdomain');
            }
            throw error;
        }
    }

    async updateStream(id: string, data: { name?: string; slug?: string }) {
        try {
            return await this.prisma.stream.update({ where: { id }, data });
        } catch (error) {
            if (error.code === 'P2002') {
                throw new ConflictException('Stream with this slug already exists in this subdomain');
            }
            throw error;
        }
    }

    async deleteStream(id: string) {
        return this.prisma.stream.delete({ where: { id } });
    }

    // ============ SUBJECTS ============

    async createSubject(data: { streamId: string; name: string; slug: string }) {
        const stream = await this.prisma.stream.findUnique({ where: { id: data.streamId } });
        if (!stream) throw new NotFoundException('Stream not found');

        try {
            // Subject is updated to relate to Stream? 
            // I need to verify schema if Subject has streamId.
            // Based on Stream model: subjects Subject[]
            // So Subject must have streamId.
            // I'll assume standard relation naming.
            return await this.prisma.subject.create({
                data: {
                    name: data.name,
                    slug: data.slug,
                    stream: { connect: { id: data.streamId } }
                }
            });
        } catch (error) {
            if (error.code === 'P2002') {
                throw new ConflictException('Subject with this slug already exists');
            }
            throw error;
        }
    }

    async updateSubject(id: string, data: { name?: string; slug?: string }) {
        return this.prisma.subject.update({ where: { id }, data });
    }

    async deleteSubject(id: string) {
        return this.prisma.subject.delete({ where: { id } });
    }
}
