import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import configuration from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ResourcesModule } from './resources/resources.module';
import { CreditsModule } from './credits/credits.module';
import { CategoriesModule } from './categories/categories.module';
import { AdminModule } from './admin/admin.module';
import { PaymentsModule } from './payments/payments.module';
import { PlansModule } from './plans/plans.module';
import { UploadsModule } from './uploads/uploads.module';
import { JwtAuthGuard } from './auth/guards';
import { RolesGuard } from './auth/guards';
import { AiModule } from './ai/ai.module';
import { SupportModule } from './support/support.module';
import { PdfModule } from './pdf/pdf.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    // Scheduled tasks (cron jobs)
    ScheduleModule.forRoot(),
    // Database
    PrismaModule,
    // Feature modules
    AuthModule,
    ResourcesModule,
    CreditsModule,
    CategoriesModule,
    AdminModule,
    PaymentsModule,
    PlansModule,
    UploadsModule,
    AiModule,
    SupportModule,
    PdfModule,
  ],
  providers: [
    // Global JWT guard (all routes protected by default)
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Global roles guard
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule { }
