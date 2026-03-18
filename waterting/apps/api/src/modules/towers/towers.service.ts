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

    return this.prisma.tower.create({
      data: {
        ...data,
        projectId,
      },
    });
  }

  async findAllByProject(user: JwtPayload, projectId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, tenantId: user.tenantId },
    });
    if (!project) throw new NotFoundException('Project not found');

    return this.prisma.tower.findMany({
      where: { projectId },
      include: { units: true },
    });
  }
}
