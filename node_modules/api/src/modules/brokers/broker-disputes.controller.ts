import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { JwtPayload, UserRole } from '@waterting/shared';

@Controller('brokers/:brokerId/disputes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BrokerDisputesController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async findAll(@Param('brokerId') brokerId: string, @CurrentUser() user: JwtPayload) {
    return this.prisma.brokerDispute.findMany({
      where: { brokerId, tenantId: user.tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post()
  @Roles(UserRole.TENANT_ADMIN, UserRole.SALES_MANAGER)
  async create(
    @Param('brokerId') brokerId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: { leadId: string; reason: string }
  ) {
    return this.prisma.brokerDispute.create({
      data: {
        ...dto,
        brokerId,
        tenantId: user.tenantId,
        status: 'OPEN',
      },
    });
  }

  @Post(':id/resolve')
  @Roles(UserRole.TENANT_ADMIN)
  async resolve(
    @Param('id') id: string,
    @Body() dto: { resolution: string; status: 'RESOLVED' | 'REJECTED' }
  ) {
    return this.prisma.brokerDispute.update({
      where: { id },
      data: { 
        resolution: dto.resolution,
        status: dto.status,
      },
    });
  }
}
