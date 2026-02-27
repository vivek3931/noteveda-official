import { Controller, Get, Patch, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { Roles } from '../auth/decorators';
import { Role } from '@prisma/client';

@ApiTags('Admin Settings')
@Controller('admin/settings')
@ApiBearerAuth()
@Roles(Role.ADMIN)
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    @Get()
    @ApiOperation({ summary: 'Get system settings' })
    @ApiQuery({ name: 'category', required: false })
    async getSettings(@Query('category') category?: string) {
        return this.settingsService.getSettings(category);
    }

    @Patch(':key')
    @ApiOperation({ summary: 'Update system setting' })
    async updateSetting(
        @Param('key') key: string,
        @Body() data: { value: string; label?: string; type?: string; category?: string }
    ) {
        return this.settingsService.updateSetting(key, data.value, data.label, data.type, data.category);
    }

    @Post('initialize')
    @ApiOperation({ summary: 'Initialize default system settings' })
    async initializeSettings() {
        return this.settingsService.initializeSettings();
    }
}
