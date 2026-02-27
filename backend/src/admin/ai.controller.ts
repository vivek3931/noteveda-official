import { Controller, Get, Patch, Query, Body, Param } from '@nestjs/common';
import { AIAdminService } from './ai.service';

@Controller('admin/ai')
export class AIAdminController {
    constructor(private readonly aiService: AIAdminService) { }

    @Get('configs')
    async getConfigs() {
        return this.aiService.getAllConfigs();
    }

    @Patch('configs/:key')
    async updateConfig(
        @Param('key') key: string,
        @Body() body: { enabled?: boolean; dailyLimit?: number; premiumOnly?: boolean; settings?: any }
    ) {
        return this.aiService.updateConfig(key, body);
    }

    @Get('stats')
    async getStats(@Query('days') days?: number) {
        return this.aiService.getStats(Number(days) || 7);
    }

    @Get('logs')
    async getLogs(
        @Query('limit') limit?: number,
        @Query('feature') feature?: string
    ) {
        return this.aiService.getLogs(Number(limit) || 20, feature);
    }
}
