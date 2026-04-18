import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtPayload } from '@waterting/shared';
import { AuditService } from '../../common/audit/audit.service';

@Injectable()
export class BrokerDisputeService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async create(user: JwtPayload, data: any) {
    const dispute = await this.prisma.brokerDispute.create({
      data: {
        ...data,
        tenantId: user.tenantId,
      },
    });

    await this.audit.log({
      tenantId: user.tenantId,
      action: 'CREATE_DISPUTE',
      entity: 'BrokerDispute',
      entityId: dispute.id,
      userId: user.sub,
      newData: dispute,
    });

    return dispute;
  }

  async resolve(user: JwtPayload, id: string, data: { resolution: string; status: string }) {
    const dispute = await this.prisma.brokerDispute.findUnique({ where: { id } });
    if (!dispute) throw new NotFoundException('Dispute not found');

    const updated = await this.prisma.brokerDispute.update({
      where: { id },
      data: {
        resolution: data.resolution,
        status: data.status, // RESOLVED, REJECTED
        updatedAt: new Date(),
      },
    });

    await this.audit.log({
      tenantId: user.tenantId,
      action: 'RESOLVE_DISPUTE',
      entity: 'BrokerDispute',
      entityId: id,
      userId: user.sub,
      oldData: dispute,
      newData: updated,
    });

    return updated;
  }

  async findAll(user: JwtPayload) {
    return this.prisma.brokerDispute.findMany({
      where: { tenantId: user.tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
