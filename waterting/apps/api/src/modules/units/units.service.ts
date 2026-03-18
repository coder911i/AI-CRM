import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtPayload, UnitStatus } from '@waterting/shared';
import { AiFollowUpWorker } from '../../workers/ai-follow-up.worker';

@Injectable()
export class UnitsService {
  constructor(
    private prisma: PrismaService,
    private aiFollowUp: AiFollowUpWorker,
  ) {}

  async create(user: JwtPayload, towerId: string, data: any) {
    const tower = await this.prisma.tower.findUnique({
      where: { id: towerId },
      include: { project: true },
    });
    if (!tower || tower.project.tenantId !== user.tenantId) {
      throw new NotFoundException('Tower not found');
    }

    return this.prisma.unit.create({
      data: {
        ...data,
        towerId,
      },
    });
  }

  async findAllByTower(user: JwtPayload, towerId: string) {
    return this.prisma.unit.findMany({
      where: { towerId, tower: { project: { tenantId: user.tenantId } } },
    });
  }

  async updateStatus(user: JwtPayload, id: string, status: UnitStatus, holdUntil?: Date) {
    const unit = await this.prisma.unit.findFirst({
      where: { id, tower: { project: { tenantId: user.tenantId } } },
      include: { tower: { include: { project: true } } },
    });
    if (!unit) throw new NotFoundException('Unit not found');

    const updated = await this.prisma.unit.update({
      where: { id },
      data: { 
        status,
        holdUntil: status === UnitStatus.RESERVED ? holdUntil : null,
      },
    });

    if (status === UnitStatus.AVAILABLE) {
        const availableCount = await this.prisma.unit.count({
            where: { tower: { projectId: unit.tower.projectId }, status: UnitStatus.AVAILABLE }
        });
        await this.aiFollowUp.sendInventoryUrgency(unit.tower.projectId, availableCount);
    }

    return updated;
  }

  async updatePrice(user: JwtPayload, id: string, newPrice: number) {
    const unit = await this.prisma.unit.findFirst({
      where: { id, tower: { project: { tenantId: user.tenantId } } },
      include: { tower: true },
    });
    if (!unit) throw new NotFoundException('Unit not found');

    const oldPrice = unit.basePrice;
    const updated = await this.prisma.unit.update({
      where: { id },
      data: { basePrice: newPrice },
    });

    if (newPrice < oldPrice) {
      await this.aiFollowUp.sendPriceDropAlert(unit.tower.projectId, newPrice);
    }

    return updated;
  }
}
