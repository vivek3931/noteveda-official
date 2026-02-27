import { Controller, Get, Post, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { CreditsService } from './credits.service';
import { CurrentUser } from '../auth/decorators';

@ApiTags('Credits')
@Controller('credits')
@ApiBearerAuth()
export class CreditsController {
    constructor(private readonly creditsService: CreditsService) { }

    @Get()
    @ApiOperation({ summary: 'Get current user credit balance' })
    @ApiResponse({ status: 200, description: 'Credit balance returned' })
    async getCredits(@CurrentUser('id') userId: string) {
        return this.creditsService.getCredits(userId);
    }

    @Post('download/:resourceId')
    @ApiOperation({ summary: 'Download resource (deducts credit)' })
    @ApiResponse({ status: 200, description: 'Download successful, returns file URL' })
    @ApiResponse({ status: 400, description: 'Insufficient credits' })
    async downloadResource(
        @CurrentUser('id') userId: string,
        @Param('resourceId') resourceId: string,
    ) {
        return this.creditsService.downloadResource(userId, resourceId);
    }

    @Get('downloads')
    @ApiOperation({ summary: 'Get download history' })
    async getDownloadHistory(@CurrentUser('id') userId: string) {
        return this.creditsService.getDownloadHistory(userId);
    }
}
