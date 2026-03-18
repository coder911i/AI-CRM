import { Controller, Get, Post, Body, Param, UseGuards, Res, Query } from '@nestjs/common';
import { Response } from 'express';
import * as QRCode from 'qrcode';
import { BrokersService } from './brokers.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { JwtPayload, UserRole } from '@waterting/shared';

@Controller('brokers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BrokersController {
  constructor(
    private readonly brokersService: BrokersService,
    private prisma: PrismaService,
  ) {}

  @Post()
  @Roles(UserRole.TENANT_ADMIN, UserRole.SALES_MANAGER)
  create(@CurrentUser() user: JwtPayload, @Body() createBrokerDto: any) {
    return this.brokersService.create(user, createBrokerDto);
  }

  @Get()
  @Roles(UserRole.TENANT_ADMIN, UserRole.SALES_MANAGER, UserRole.SALES_AGENT)
  findAll(@CurrentUser() user: JwtPayload, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.brokersService.findAll(user, Number(page || 1), Number(limit || 50));
  }

  @Get(':id')
  @Roles(UserRole.TENANT_ADMIN, UserRole.SALES_MANAGER, UserRole.SALES_AGENT)
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.brokersService.findOne(user, id);
  }

  @Post(':id/approve')
  @Roles(UserRole.TENANT_ADMIN)
  async approve(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.prisma.broker.update({
      where: { id, tenantId: user.tenantId },
      data: { isActive: true },
    });
  }

  @Get(':id/qr')
  async getQR(@Param('id') id: string, @Res() res: Response) {
    const broker = await this.prisma.broker.findUnique({ where: { id } });
    if (!broker) return res.status(404).json({ message: 'Broker not found' });
    
    const url = `${process.env.FRONTEND_URL}/refer/${broker.referralCode}`;
    const qrBuffer = await QRCode.toBuffer(url, { width: 400, type: 'png' });
    res.setHeader('Content-Type', 'image/png');
    res.send(qrBuffer);
  }

  @Get(':id/statement')
  getStatement(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.brokersService.getStatement(user, id);
  }
}
