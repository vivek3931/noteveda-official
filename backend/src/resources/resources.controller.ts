import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ResourcesService } from './resources.service';
import { CreateResourceDto, UpdateResourceDto, QueryResourcesDto } from './dto';
import { Public, CurrentUser, Roles } from '../auth/decorators';
import { Role } from '@prisma/client';

@ApiTags('Resources')
@Controller('resources')
export class ResourcesController {
    constructor(private readonly resourcesService: ResourcesService) { }

    @Public()
    @Get()
    @ApiOperation({ summary: 'Get paginated list of resources with filters' })
    @ApiResponse({ status: 200, description: 'List of resources' })
    async findAll(@Query() query: QueryResourcesDto) {
        return this.resourcesService.findAll({
            ...query,
            page: query.page ? Number(query.page) : 1,
            limit: query.limit ? Number(query.limit) : 12,
        });
    }

    @Public()
    @Get('featured')
    @ApiOperation({ summary: 'Get featured resources' })
    async getFeatured(@Query('limit') limit?: number) {
        return this.resourcesService.getFeatured(limit ? Number(limit) : 6);
    }

    @Public()
    @Get('trending')
    @ApiOperation({ summary: 'Get trending resources' })
    async getTrending(@Query('limit') limit?: number) {
        return this.resourcesService.getTrending(limit ? Number(limit) : 6);
    }

    @Public()
    @Get(':id')
    @ApiOperation({ summary: 'Get single resource by ID' })
    @ApiResponse({ status: 200, description: 'Resource found' })
    @ApiResponse({ status: 404, description: 'Resource not found' })
    async findOne(@Param('id') id: string) {
        return this.resourcesService.findOne(id);
    }

    @Post()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new resource' })
    @ApiResponse({ status: 201, description: 'Resource created successfully' })
    @ApiResponse({ status: 400, description: 'Duplicate file detected' })
    async create(@CurrentUser('id') userId: string, @Body() dto: CreateResourceDto) {
        return this.resourcesService.create(userId, dto);
    }

    @Patch(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a resource (owner only)' })
    @ApiResponse({ status: 200, description: 'Resource updated' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    async update(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
        @Body() dto: UpdateResourceDto,
    ) {
        return this.resourcesService.update(id, userId, dto);
    }

    @Delete(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a resource (owner or admin)' })
    @ApiResponse({ status: 200, description: 'Resource deleted' })
    async delete(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
        @CurrentUser('role') role: Role,
    ) {
        return this.resourcesService.delete(id, userId, role === 'ADMIN');
    }

    @Get('user/uploads')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current user uploads' })
    async getUserUploads(@CurrentUser('id') userId: string) {
        return this.resourcesService.getUserUploads(userId);
    }
}
