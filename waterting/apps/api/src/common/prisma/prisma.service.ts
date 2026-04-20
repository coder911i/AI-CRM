import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { TenantContext } from '../middleware/tenant.middleware';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  
  // Create an extended client for multi-tenancy
  readonly extended = this.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const tenantId = TenantContext.getTenantId();
          
          const modelsWithTenantId = [
            'Project', 'Lead', 'Broker', 'Booking', 'Payment', 
            'SiteVisit', 'Unit', 'Tower', 'Floor', 'Listing', 
            'Notification', 'AuditLog', 'Commission', 'Automation',
            'Embedding', 'Activity', 'Agency', 'Property', 'PropertyVisit'
          ];

          if (tenantId && modelsWithTenantId.includes(model)) {
            args.where = { ...args.where, tenantId };
          }
          return query(args);
        },
      },
    },
  });

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
