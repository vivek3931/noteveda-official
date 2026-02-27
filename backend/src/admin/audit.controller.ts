import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { AuditService } from './audit.service';

@ApiTags('Admin Audit Logs')
@Controller('admin/audit')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class AuditController {
    constructor(private auditService: AuditService) { }

    @Get()
    @ApiOperation({ summary: 'Get audit logs' })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'offset', required: false, type: Number })
    @ApiQuery({ name: 'action', required: false, type: String })
    @ApiQuery({ name: 'adminId', required: false, type: String })
    async getLogs(
        @Query('limit') limit?: number,
        @Query('offset') offset?: number,
        @Query('action') action?: string,
        @Query('adminId') adminId?: string,
    ) {
        return this.auditService.getLogs(
            limit ? Number(limit) : 50,
            offset ? Number(offset) : 0,
            action,
            adminId,
        );
    }
}
