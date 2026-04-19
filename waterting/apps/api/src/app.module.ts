import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuditModule } from './common/audit/audit.module';
import { AIModule } from './common/ai/ai.module';
import { RealtimeModule } from './common/realtime/realtime.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { TenantsModule } from './modules/tenants/tenants.module';
import { UsersModule } from './modules/users/users.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { LeadsModule } from './modules/leads/leads.module';
import { TowersModule } from './modules/towers/towers.module';
import { UnitsModule } from './modules/units/units.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { SiteVisitsModule } from './modules/site-visits/site-visits.module';
import { BrokersModule } from './modules/brokers/brokers.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { MediaModule } from './modules/media/media.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AutomationsModule } from './modules/automations/automations.module';
import { PortalModule } from './modules/portal/portal.module';
import { ActivitiesModule } from './modules/activities/activities.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ListingsModule } from './modules/listings/listings.module';
import { AdsModule } from './modules/ads/ads.module';
import { ListingSyncModule } from './modules/listing-sync/listing-sync.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { WorkersModule } from './workers/workers.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    BullModule.forRoot({
      redis: process.env.REDIS_URL,
    }),
    BullModule.registerQueue(
      { name: 'ai-scoring' },
      { name: 'email' },
      { name: 'pdf' },
      { name: 'portal-sync' },
    ),
    PrismaModule,
    AuditModule,
    AIModule,
    RealtimeModule,
    AuthModule,
    TenantsModule,
    UsersModule,
    ProjectsModule,
    LeadsModule,
    TowersModule,
    UnitsModule,
    WebhooksModule,
    SiteVisitsModule,
    BrokersModule,
    BookingsModule,
    PaymentsModule,
    MediaModule,
    DashboardModule,
    AnalyticsModule,
    AutomationsModule,
    PortalModule,
    ActivitiesModule,
    NotificationsModule,
    ListingsModule,
    AdsModule,
    ListingSyncModule,
    WorkersModule,
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 60000, limit: 10 },
      { name: 'login', ttl: 60000, limit: 5 },
    ]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
