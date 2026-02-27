import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
    constructor(private readonly prisma: PrismaService) { }

    async getSetting(key: string, defaultValue: number = 0): Promise<number> {
        const setting = await this.prisma.systemSetting.findUnique({ where: { key } });
        return setting ? parseInt(setting.value) : defaultValue;
    }

    async getSettings(category?: string) {
        const where = category ? { category } : {};
        return this.prisma.systemSetting.findMany({ where, orderBy: { key: 'asc' } });
    }

    async updateSetting(key: string, value: string, label?: string, type?: string, category?: string) {
        return this.prisma.systemSetting.upsert({
            where: { key },
            create: { key, value, label, type: type || 'string', category: category || 'general' },
            update: { value },
        });
    }

    // Initialize default settings
    async initializeSettings() {
        const defaults = [
            { key: 'report_hide_threshold', value: '5', type: 'number', category: 'moderation', label: 'Reports to auto-hide' },
            { key: 'report_delete_threshold', value: '10', type: 'number', category: 'moderation', label: 'Reports to auto-delete' },
            { key: 'ai_daily_limit_free', value: '5', type: 'number', category: 'ai', label: 'AI daily limit (free users)' },
            { key: 'ai_daily_limit_premium', value: '100', type: 'number', category: 'ai', label: 'AI daily limit (premium)' },
            { key: 'upload_max_size_mb', value: '50', type: 'number', category: 'upload', label: 'Max upload size (MB)' },
        ];

        for (const setting of defaults) {
            await this.prisma.systemSetting.upsert({
                where: { key: setting.key },
                create: setting,
                update: {},
            });
        }

        return { message: 'Settings initialized' };
    }
}
