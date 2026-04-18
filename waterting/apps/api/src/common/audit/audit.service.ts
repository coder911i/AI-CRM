import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface AuditLogOptions {
  tenantId: string;
  action: string;
  entity: string;
  entityId: string;
  userId?: string;
  oldData?: any;
  newData?: any;
  ipAddress?: string;
}

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(options: AuditLogOptions) {
    const { tenantId, action, entity, entityId, userId, oldData, newData, ipAddress } = options;
    return this.prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action,
        entity,
        entityId,
        oldData: oldData ? JSON.parse(JSON.stringify(oldData)) : null,
        newData: newData ? JSON.parse(JSON.stringify(newData)) : null,
        ipAddress,
      },
    });
  }
}
