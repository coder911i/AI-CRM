import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(
    tenantId: string,
    action: string,
    entity: string,
    entityId: string,
    userId?: string,
    oldData?: any,
    newData?: any,
    ipAddress?: string,
  ) {
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
