import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtPayload } from '@waterting/shared';

@Injectable()
export class TowersService {
  constructor(private prisma: PrismaService) {}

  async create(user: JwtPayload, projectId: string, data: any) {
    // Validate project belongs to tenant
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, tenantId: user.tenantId },
    });
    if (!project) throw new NotFoundException('Project not found');

    const tower = await this.prisma.tower.create({
      data: {
        ...data,
        projectId,
      },
    });

    if (data.totalFloors) {
      const floorsData = Array.from({ length: data.totalFloors }).map((_, i) => ({
        towerId: tower.id,
        floorNumber: i + 1,
      }));

      await this.prisma.floor.createMany({
        data: floorsData,
      });
    }

    return tower;
  }

  async findAllByProject(user: JwtPayload, projectId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, tenantId: user.tenantId },
    });
    if (!project) throw new NotFoundException('Project not found');

    return this.prisma.tower.findMany({
      where: { projectId },
      include: { 
        floors: {
          include: { units: true }
        },
        units: true 
      },
    });
  }

  async update(user: JwtPayload, id: string, data: any) {
    const tower = await this.prisma.tower.findFirst({
      where: { id, project: { tenantId: user.tenantId } },
    });
    if (!tower) throw new NotFoundException('Tower not found');

    return this.prisma.tower.update({
      where: { id },
      data,
    });
  }
}
