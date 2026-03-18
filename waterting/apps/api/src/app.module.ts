import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './common/prisma/prisma.module';
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

@Module({
  imports: [
    PrismaModule,
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
  ],
})
export class AppModule {}
