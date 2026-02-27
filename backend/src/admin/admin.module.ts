import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { CreditsModule } from '../credits/credits.module';

import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { AIAdminService } from './ai.service';
import { AIAdminController } from './ai.controller';
import { MonetizationService } from './monetization.service';
import { MonetizationController } from './monetization.controller';
import { PremiumService } from './premium.service';
import { PremiumController } from './premium.controller';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { SupportService } from './support.service';
import { SupportController } from './support.controller';

@Module({
    imports: [CreditsModule],
    controllers: [
        AdminController,
        CategoriesController,
        AIAdminController,
        MonetizationController,
        PremiumController,
        AnalyticsController,
        SettingsController,
        AuditController,
        NotificationsController,
        SupportController,
    ],
    providers: [
        AdminService,
        CategoriesService,
        AIAdminService,
        MonetizationService,
        PremiumService,
        AnalyticsService,
        SettingsService,
        AuditService,
        NotificationsService,
        SupportService,
    ],
})
export class AdminModule { }
