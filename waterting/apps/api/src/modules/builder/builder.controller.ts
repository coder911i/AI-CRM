import { Controller, Get, UseGuards } from '@nestjs/common';
import { BuilderService } from './builder.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { JwtPayload, UserRole } from '@waterting/shared';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('builder')
@ApiBearerAuth('JWT-auth')
@Controller('builder')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('BUILDER', 'TENANT_ADMIN')
export class BuilderController {
  constructor(private readonly builderService: BuilderService) {}

  @Get('dashboard')
  getDashboard(@CurrentUser() user: JwtPayload) {
    return this.builderService.getDashboard(user);
  }
}
