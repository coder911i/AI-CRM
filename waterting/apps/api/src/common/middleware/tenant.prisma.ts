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
            let where = args.where as any;
            if (!where) {
              where = {};
            }
            // Only inject tenantId if not explicitly provided / handling nested relates
            if (operation === 'findMany' || operation === 'findFirst' || operation === 'findUnique' || operation === 'count') {
              where.tenantId = tenantId;
            } else if (operation === 'create' || operation === 'createMany') {
               const data = args.data as any;
               if (Array.isArray(data)) {
                 data.forEach(d => { if (!d.tenantId) d.tenantId = tenantId });
               } else {
                 if (!data.tenantId) data.tenantId = tenantId;
               }
            } else if (operation === 'update' || operation === 'updateMany' || operation === 'delete' || operation === 'deleteMany') {
                where.tenantId = tenantId;
            }
            args.where = where;
          }

          return query(args);
        },
      },
    },
  });
}
