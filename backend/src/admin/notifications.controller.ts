import { Controller, Get, Post, Delete, Body, Param, Query, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { NotificationsService } from './notifications.service';

@ApiTags('Admin Notifications')
@Controller('admin/notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class NotificationsController {
    constructor(private notificationsService: NotificationsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new announcement' })
    async createAnnouncement(
        @Body() body: { title: string; message: string; type: string; target: string; expiresAt?: string },
    ) {
        return this.notificationsService.createAnnouncement(
            body.title,
            body.message,
            body.type,
            body.target,
            body.expiresAt ? new Date(body.expiresAt) : undefined,
        );
    }

    @Get()
    @ApiOperation({ summary: 'Get all announcements' })
    @ApiQuery({ name: 'activeOnly', required: false, type: Boolean })
    async getAnnouncements(@Query('activeOnly') activeOnly?: string) {
        return this.notificationsService.getAnnouncements(activeOnly === 'true');
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete an announcement' })
    async deleteAnnouncement(@Param('id') id: string) {
        return this.notificationsService.deleteAnnouncement(id);
    }

    @Patch(':id/status')
    @ApiOperation({ summary: 'Toggle announcement status' })
    async toggleStatus(@Param('id') id: string, @Body() body: { isActive: boolean }) {
        return this.notificationsService.toggleAnnouncementStatus(id, body.isActive);
    }
}
