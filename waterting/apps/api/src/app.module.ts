import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { configValidationSchema } from './common/config/config.schema';
import { PrismaModule } from './common/prisma/prisma.module';
import { RedisModule } from './common/redis/redis.module';
import { AuditModule } from './common/audit/audit.module';
import { AIModule } from './common/ai/ai.module';
import { EmailModule } from './common/email/email.module';
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
import { ChatbotModule } from './modules/chatbot/chatbot.module';
import { GatewaysModule } from './gateways/gateways.module';
import { RefundsModule } from './modules/refunds/refunds.module';
import { BuilderModule } from './modules/builder/builder.module';
import { CommunicationModule } from './common/comm/communication.module';
import { AllocationModule } from './modules/allocation/allocation.module';
import { OwnerPortalModule } from './modules/owner-portal/owner-portal.module';
import { BrokerPortalModule } from './modules/broker-portal/broker-portal.module';
import { AgentPanelModule } from './modules/agent-panel/agent-panel.module';
import { AdminModule } from './modules/admin/admin.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { WorkersModule } from './workers/workers.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { TenantInterceptor } from './common/interceptors/tenant.interceptor';
import { NestModule, MiddlewareConsumer } from '@nestjs/common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configValidationSchema,
    }),
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
    RedisModule,
    AuditModule,
    AIModule,
    EmailModule,
    GatewaysModule,
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
    ChatbotModule,
    RefundsModule,
    BuilderModule,
    CommunicationModule,
    AllocationModule,
    OwnerPortalModule,
    BrokerPortalModule,
    AgentPanelModule,
    AdminModule,
    WorkersModule,
    ThrottlerModule.forRoot([
      { name: 'default', ttl: 60000, limit: 60 },
      { name: 'auth', ttl: 60000, limit: 5 },
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
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*');
  }
}
