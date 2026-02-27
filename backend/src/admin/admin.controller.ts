import { Controller, Get, Patch, Param, Query, Body, Delete, Post, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { Roles } from '../auth/decorators';
import { Role, ReportReason } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Admin')
@Controller('admin')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@UseGuards(JwtAuthGuard)
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    // ============ DASHBOARD ============

    @Get('dashboard')
    @ApiOperation({ summary: 'Get enhanced admin dashboard statistics' })
    @ApiResponse({ status: 200, description: 'Dashboard stats' })
    async getDashboard() {
        return this.adminService.getDashboardStats();
    }

    @Get('dashboard/top-reported')
    @ApiOperation({ summary: 'Get top reported resources' })
    async getTopReported(@Query('limit') limit?: number) {
        return this.adminService.getTopReportedResources(Number(limit) || 10);
    }

    // Legacy endpoint for backward compatibility
    @Get('stats')
    @ApiOperation({ summary: 'Get admin dashboard statistics (legacy)' })
    async getStats() {
        return this.adminService.getDashboardStats();
    }

    // ============ RESOURCES ============

    @Get('resources')
    @ApiOperation({ summary: 'Get all resources with enhanced filters' })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'status', required: false, enum: ['all', 'active', 'hidden', 'deleted'] })
    @ApiQuery({ name: 'sortBy', required: false, enum: ['newest', 'oldest', 'downloads', 'views', 'reports'] })
    @ApiQuery({ name: 'search', required: false })
    @ApiQuery({ name: 'category', required: false })
    @ApiQuery({ name: 'subject', required: false })
    async getAllResources(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('status') status?: string,
        @Query('sortBy') sortBy?: string,
        @Query('search') search?: string,
        @Query('category') category?: string,
        @Query('subject') subject?: string,
    ) {
        return this.adminService.getAllResources(
            Number(page) || 1,
            Number(limit) || 20,
            status,
            sortBy,
            search,
            category,
            subject,
        );
    }

    @Get('resources/:id')
    @ApiOperation({ summary: 'Get full resource details with reports' })
    async getResourceById(@Param('id') id: string) {
        return this.adminService.getResourceById(id);
    }

    @Patch('resources/:id/hide')
    @ApiOperation({ summary: 'Hide a resource' })
    async hideResource(@Param('id') id: string, @Body() body: { reason: string }, @Request() req: any) {
        return this.adminService.hideResource(id, req.user.id, body.reason || 'Admin manual action');
    }

    @Patch('resources/:id/restore')
    @ApiOperation({ summary: 'Restore a hidden/deleted resource (admin override)' })
    async restoreResource(@Param('id') id: string, @Request() req: any) {
        return this.adminService.restoreResource(id, req.user.id);
    }

    @Patch('resources/:id/archive')
    @ApiOperation({ summary: 'Archive (soft delete) a resource' })
    async archiveResource(@Param('id') id: string, @Request() req: any) {
        return this.adminService.archiveResource(id, req.user.id);
    }

    @Patch('resources/:id/private')
    @ApiOperation({ summary: 'Toggle resource visibility (legacy)' })
    async toggleResourcePrivate(@Param('id') id: string) {
        // Legacy: calls hide/restore internally or separate logic?
        // For now keep as is, but if it breaks, we fix it.
        return this.adminService.toggleResourcePrivate(id);
    }

    @Delete('resources/:id')
    @ApiOperation({ summary: 'Delete a resource permanently' })
    async deleteResource(@Param('id') id: string) {
        return this.adminService.deleteResource(id);
    }

    // ============ MODERATION & REPORTS ============

    @Get('moderation/stats')
    @ApiOperation({ summary: 'Get moderation statistics' })
    async getModerationStats() {
        return this.adminService.getModerationStats();
    }

    @Get('moderation/reported')
    @ApiOperation({ summary: 'Get all reported resources' })
    async getReportedResources(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.adminService.getReportedResources(Number(page) || 1, Number(limit) || 20);
    }

    // ============ USERS ============

    @Get('users')
    @ApiOperation({ summary: 'Get all users with filters' })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiQuery({ name: 'role', required: false, enum: ['all', 'user', 'admin', 'premium'] })
    @ApiQuery({ name: 'status', required: false, enum: ['all', 'active', 'suspended'] })
    async getUsers(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('search') search?: string,
        @Query('role') role?: string,
        @Query('status') status?: string,
    ) {
        return this.adminService.getUsers(
            Number(page) || 1,
            Number(limit) || 20,
            search,
            role,
            status,
        );
    }

    @Get('users/:id')
    @ApiOperation({ summary: 'Get user details with activity' })
    async getUserDetails(@Param('id') id: string) {
        return this.adminService.getUserDetails(id);
    }

    @Patch('users/:id/credits')
    @ApiOperation({ summary: 'Adjust user credits' })
    async adjustCredits(
        @Param('id') id: string,
        @Body() body: { amount: number; type: 'daily' | 'upload' },
    ) {
        return this.adminService.adjustCredits(id, body.amount, body.type);
    }

    @Patch('users/:id/toggle-status')
    @ApiOperation({ summary: 'Suspend or unsuspend a user' })
    async toggleUserStatus(@Param('id') id: string, @Request() req: any) {
        return this.adminService.suspendUser(id, req.user.id);
    }

    @Post('users/:id/subscription')
    @ApiOperation({ summary: 'Upgrade user subscription' })
    async upgradeSubscription(
        @Param('id') id: string,
        @Body() body: { planId: string; durationMonths?: number },
    ) {
        return this.adminService.upgradeSubscription(id, body.planId, body.durationMonths);
    }

}

