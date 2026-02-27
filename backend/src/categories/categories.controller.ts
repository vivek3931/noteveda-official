import { Controller, Get, Post, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { Public } from '../auth/decorators';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Public()
    @Get('domains')
    @ApiOperation({ summary: 'Get all domains with subdomains' })
    @ApiResponse({ status: 200, description: 'List of domains' })
    async getDomains() {
        return this.categoriesService.getDomains();
    }

    @Public()
    @Get('domains/:domainId/subdomains')
    @ApiOperation({ summary: 'Get subdomains for a specific domain' })
    async getSubDomains(@Param('domainId') domainId: string) {
        return this.categoriesService.getSubDomains(domainId);
    }

    @Public()
    @Get('stats')
    @ApiOperation({ summary: 'Get platform statistics' })
    @ApiResponse({ status: 200, description: 'Platform stats' })
    async getStats() {
        return this.categoriesService.getStats();
    }

    @Post('seed')
    @ApiOperation({ summary: 'Seed initial categories (dev only)' })
    async seedCategories() {
        return this.categoriesService.seedCategories();
    }
}
