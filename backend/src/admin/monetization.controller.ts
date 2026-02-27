import { Controller, Get, Patch, Query, Body, Param } from '@nestjs/common';
import { MonetizationService } from './monetization.service';

@Controller('admin/monetization')
export class MonetizationController {
    constructor(private readonly monetizationService: MonetizationService) { }

    @Get('configs')
    async getConfigs() {
        return this.monetizationService.getAllConfigs();
    }

    @Patch('configs/:id')
    async updateConfig(
        @Param('id') id: string,
        @Body() body: { enabled?: boolean; adUnitId?: string; settings?: any }
    ) {
        return this.monetizationService.updateConfig(id, body);
    }

    @Get('stats')
    async getStats(@Query('days') days?: number) {
        return this.monetizationService.getStats(Number(days) || 7);
    }
}
