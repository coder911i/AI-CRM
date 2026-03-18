import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { BrokersService } from './brokers.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { JwtPayload, UserRole } from '@waterting/shared';

@Controller('brokers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BrokersController {
  constructor(private readonly brokersService: BrokersService) {}

  @Post()
  @Roles(UserRole.TENANT_ADMIN, UserRole.SALES_MANAGER)
  create(@CurrentUser() user: JwtPayload, @Body() createBrokerDto: any) {
    return this.brokersService.create(user, createBrokerDto);
  }

  @Get()
  @Roles(UserRole.TENANT_ADMIN, UserRole.SALES_MANAGER, UserRole.SALES_AGENT)
  findAll(@CurrentUser() user: JwtPayload) {
    return this.brokersService.findAll(user);
  }

  @Get(':id')
  @Roles(UserRole.TENANT_ADMIN, UserRole.SALES_MANAGER, UserRole.SALES_AGENT)
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.brokersService.findOne(user, id);
  }
}
