import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { JwtPayload } from '@waterting/shared';

@Controller('leads')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() createLeadDto: any) {
    return this.leadsService.create(user, createLeadDto);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.leadsService.findAll(user);
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.leadsService.findOne(user, id);
  }

  @Patch(':id/stage')
  updateStage(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body('stage') stage: string) {
    return this.leadsService.updateStage(user, id, stage);
  }
}
