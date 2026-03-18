import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtPayload } from '@waterting/shared';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async findAll(user: JwtPayload, page = 1, limit = 50) {
    return this.prisma.project.findMany({
      where: { tenantId: user.tenantId },
      take: limit,
      skip: (page - 1) * limit,
      include: { towers: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(user: JwtPayload, id: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, tenantId: user.tenantId },
      include: { towers: { include: { units: true } } },
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async create(user: JwtPayload, data: any) {
    return this.prisma.project.create({
      data: {
        ...data,
        tenantId: user.tenantId,
      },
    });
  }

  async update(user: JwtPayload, id: string, data: any) {
    return this.prisma.project.updateMany({
      where: { id, tenantId: user.tenantId },
      data,
    });
  }

  async remove(user: JwtPayload, id: string) {
    return this.prisma.project.deleteMany({
      where: { id, tenantId: user.tenantId },
    });
  }
}
