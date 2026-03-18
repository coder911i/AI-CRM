import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtPayload } from '@waterting/shared';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async getMyTenant(user: JwtPayload) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: user.tenantId },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  async updateMyTenant(user: JwtPayload, data: any) {
    return this.prisma.tenant.update({
      where: { id: user.tenantId },
      data,
    });
  }
}
