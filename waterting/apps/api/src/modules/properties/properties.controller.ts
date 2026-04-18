import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('properties')
@UseGuards(JwtAuthGuard)
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  create(@Request() req, @Body() data: any) {
    return this.propertiesService.create(req.user.tenantId, req.user.id, data);
  }

  @Get()
  findAll(@Request() req) {
    return this.propertiesService.findAll(req.user.tenantId);
  }

  @Get('owner-dashboard')
  getOwnerDashboard(@Request() req) {
    return this.propertiesService.getOwnerDashboard(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.propertiesService.findOne(id);
  }
}
