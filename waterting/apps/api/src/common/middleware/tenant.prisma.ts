import { PrismaClient } from '@prisma/client';

export function getTenantPrisma(tenantId: string) {
  const prisma = new PrismaClient();
  
  return prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          // If the model has a tenantId, append it to the query args
          // Note: some models don't have tenantId (e.g. Unit, Tower, Payment, Booking)
          // For models that DO have tenantId, we scope it.
          const modelsWithTenant = ['User', 'Project', 'Lead', 'Broker', 'Automation', 'Embedding'];
          
          if (modelsWithTenant.includes(model)) {
            // Only inject tenantId if not explicitly provided
            if (operation === 'findMany' || operation === 'findFirst' || operation === 'findUnique' || operation === 'count') {
              let where = (args as any).where || {};
              where.tenantId = tenantId;
              (args as any).where = where;
            } else if (operation === 'create' || operation === 'createMany') {
               const data = (args as any).data;
               if (data) {
                 if (Array.isArray(data)) {
                   data.forEach(d => { if (!d.tenantId) d.tenantId = tenantId });
                 } else {
                   if (!data.tenantId) data.tenantId = tenantId;
                 }
               }
            } else if (operation === 'update' || operation === 'updateMany' || operation === 'delete' || operation === 'deleteMany') {
                let where = (args as any).where || {};
                where.tenantId = tenantId;
                (args as any).where = where;
            }
          }

          return query(args);
        },
      },
    },
  });
}
