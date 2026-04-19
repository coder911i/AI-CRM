import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtPayload, UnitStatus } from '@waterting/shared';
import { AiFollowUpWorker } from '../../workers/ai-follow-up.worker';

import { EventsGateway } from '../../gateways/events.gateway';

@Injectable()
export class UnitsService {
  constructor(
    private prisma: PrismaService,
    private aiFollowUp: AiFollowUpWorker,
    private gateway: EventsGateway,
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

    this.gateway.emitUnitUpdate(user.tenantId, id, status);

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
  async placeHold(user: JwtPayload, id: string, data: { leadId: string; durationHours: number }) {
    const holdUntil = new Date(Date.now() + data.durationHours * 60 * 60 * 1000);
    return this.updateStatus(user, id, UnitStatus.RESERVED, holdUntil);
  }

  async releaseHold(user: JwtPayload, id: string) {
    return this.updateStatus(user, id, UnitStatus.AVAILABLE);
  }

  async extendHold(user: JwtPayload, id: string, additionalHours: number) {
    const unit = await this.prisma.unit.findFirst({
      where: { id, tower: { project: { tenantId: user.tenantId } } },
    });
    if (!unit || !unit.holdUntil) throw new NotFoundException('No active hold found');

    const newHoldUntil = new Date(unit.holdUntil.getTime() + additionalHours * 60 * 60 * 1000);
    return this.prisma.unit.update({
      where: { id },
      data: { holdUntil: newHoldUntil },
    });
  }
}
