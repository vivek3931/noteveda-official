import { Controller, Get, Post, Patch, Query, Body, Param } from '@nestjs/common';
import { PremiumService } from './premium.service';
import { BillingInterval } from '@prisma/client';

@Controller('admin/premium')
export class PremiumController {
    constructor(private readonly premiumService: PremiumService) { }

    @Get('plans')
    async getPlans() {
        return this.premiumService.getPlans();
    }

    @Post('plans')
    async createPlan(@Body() body: any) {
        return this.premiumService.createPlan({
            ...body,
            interval: body.interval as BillingInterval
        });
    }

    @Patch('plans/:id')
    async updatePlan(@Param('id') id: string, @Body() body: any) {
        return this.premiumService.updatePlan(id, body);
    }

    @Get('users')
    async getPremiumUsers(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('search') search?: string
    ) {
        return this.premiumService.getPremiumUsers({
            page: Number(page) || 1,
            limit: Number(limit) || 10,
            search
        });
    }
}
