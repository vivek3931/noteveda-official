import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PlansService } from './plans.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('plans')
@Controller('plans')
export class PlansController {
    constructor(private readonly plansService: PlansService) { }

    @Public()
    @Get()
    @ApiOperation({ summary: 'Get all active plans' })
    @ApiResponse({ status: 200, description: 'Return all active plans.' })
    findAll() {
        return this.plansService.findAll();
    }

    @Public() // Allow seeding without auth for now (or keep protected if preferred, but needed for convenient seeding)
    @Get('seed')
    @ApiOperation({ summary: 'Seed initial plans' })
    seed() {
        return this.plansService.seedPlans();
    }
}
