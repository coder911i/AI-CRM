import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtPayload, UnitStatus } from '@waterting/shared';

@Injectable()
export class UnitsService {
  constructor(private prisma: PrismaService) {}

  async create(user: JwtPayload, towerId: string, data: any) {
    // Basic verification: tower belongs to project belonging to tenant
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
    });
    if (!unit) throw new NotFoundException('Unit not found');

    return this.prisma.unit.update({
      where: { id },
      data: { 
        status,
        holdUntil: status === UnitStatus.RESERVED ? holdUntil : null,
      },
    });
  }
}
