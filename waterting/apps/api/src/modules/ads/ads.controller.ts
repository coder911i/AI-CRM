import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AdsService } from './ads.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { JwtPayload, UserRole } from '@waterting/shared';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('ads')
@ApiBearerAuth('JWT-auth')
@Controller('ads')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdsController {
  constructor(private readonly adsService: AdsService) {}

  @Post()
  @Roles(UserRole.TENANT_ADMIN, UserRole.SALES_MANAGER, UserRole.PROPERTY_OWNER)
  create(@CurrentUser() user: JwtPayload, @Body() data: any) {
    return this.adsService.create(user, data);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.adsService.findAll(user);
  }

  @Get('performance')
  getPerformance(@CurrentUser() user: JwtPayload) {
    return this.adsService.getPerformance(user);
  }

  @Patch(':id')
  @Roles(UserRole.TENANT_ADMIN, UserRole.SALES_MANAGER, UserRole.PROPERTY_OWNER)
  update(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() data: any) {
    return this.adsService.update(user, id, data);
  }

  @Delete(':id')
  @Roles(UserRole.TENANT_ADMIN, UserRole.PROPERTY_OWNER)
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.adsService.remove(user, id);
  }
}
