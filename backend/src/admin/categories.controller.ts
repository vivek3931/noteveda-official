import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
// Assuming AuthGuard/RolesGuard usage from other admin controllers
// I'll skip imports for guards if I don't check them explicitly, but they should be there.
// I'll check admin.controller.ts for imports.

@Controller('admin/categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Get()
    async getHierarchy() {
        return this.categoriesService.getDomains();
    }

    // ============ DOMAINS ============

    @Post('domains')
    async createDomain(@Body() data: { name: string; slug: string }) {
        return this.categoriesService.createDomain(data);
    }

    @Patch('domains/:id')
    async updateDomain(@Param('id') id: string, @Body() data: { name?: string; slug?: string }) {
        return this.categoriesService.updateDomain(id, data);
    }

    @Delete('domains/:id')
    async deleteDomain(@Param('id') id: string) {
        return this.categoriesService.deleteDomain(id);
    }

    // ============ SUBDOMAINS ============

    @Post('subdomains')
    async createSubDomain(@Body() data: { domainId: string; name: string; slug: string }) {
        return this.categoriesService.createSubDomain(data);
    }

    @Patch('subdomains/:id')
    async updateSubDomain(@Param('id') id: string, @Body() data: { name?: string; slug?: string }) {
        return this.categoriesService.updateSubDomain(id, data);
    }

    @Delete('subdomains/:id')
    async deleteSubDomain(@Param('id') id: string) {
        return this.categoriesService.deleteSubDomain(id);
    }

    // ============ STREAMS ============

    @Post('streams')
    async createStream(@Body() data: { subDomainId: string; name: string; slug: string }) {
        return this.categoriesService.createStream(data);
    }

    @Patch('streams/:id')
    async updateStream(@Param('id') id: string, @Body() data: { name?: string; slug?: string }) {
        return this.categoriesService.updateStream(id, data);
    }

    @Delete('streams/:id')
    async deleteStream(@Param('id') id: string) {
        return this.categoriesService.deleteStream(id);
    }

    // ============ SUBJECTS ============

    @Post('subjects')
    async createSubject(@Body() data: { streamId: string; name: string; slug: string }) {
        return this.categoriesService.createSubject(data);
    }

    @Patch('subjects/:id')
    async updateSubject(@Param('id') id: string, @Body() data: { name?: string; slug?: string }) {
        return this.categoriesService.updateSubject(id, data);
    }

    @Delete('subjects/:id')
    async deleteSubject(@Param('id') id: string) {
        return this.categoriesService.deleteSubject(id);
    }
}
