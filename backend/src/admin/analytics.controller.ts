import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { Roles } from '../auth/decorators';
import { Role } from '@prisma/client';

@ApiTags('Admin Analytics')
@Controller('admin/analytics')
@ApiBearerAuth()
@Roles(Role.ADMIN)
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @Get('growth')
    @ApiOperation({ summary: 'Get user growth metrics (last 30 days)' })
    async getGrowth() {
        return this.analyticsService.getGrowthMetrics();
    }

    @Get('content')
    @ApiOperation({ summary: 'Get content content metrics (top downloads, trending)' })
    async getContent() {
        return this.analyticsService.getContentMetrics();
    }

    @Get('activity')
    @ApiOperation({ summary: 'Get user activity metrics' })
    async getActivity() {
        return this.analyticsService.getActivityMetrics();
    }
}
