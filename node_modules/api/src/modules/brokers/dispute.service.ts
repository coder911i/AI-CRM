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

    await this.audit.log(
      user.tenantId,
      'CREATE_DISPUTE',
      'BrokerDispute',
      dispute.id,
      user.sub,
      null,
      dispute,
    );

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

    await this.audit.log(
      user.tenantId,
      'RESOLVE_DISPUTE',
      'BrokerDispute',
      id,
      user.sub,
      dispute,
      updated,
    );

    return updated;
  }

  async findAll(user: JwtPayload) {
    return this.prisma.brokerDispute.findMany({
      where: { tenantId: user.tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
