import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { AutomationsService } from './automations.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { JwtPayload, UserRole } from '@waterting/shared';

@Controller('automations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AutomationsController {
  constructor(private readonly automationsService: AutomationsService) {}

  @Post()
  @Roles(UserRole.TENANT_ADMIN, UserRole.SALES_MANAGER)
  create(@CurrentUser() user: JwtPayload, @Body() data: any) {
    return this.automationsService.create(user, data);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.automationsService.findAll(user);
  }

  @Patch(':id/toggle')
  @Roles(UserRole.TENANT_ADMIN, UserRole.SALES_MANAGER)
  toggle(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.automationsService.toggle(user, id);
  }
}
