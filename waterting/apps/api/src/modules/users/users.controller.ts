import { Controller, Get, Post, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { JwtPayload, UserRole } from '@waterting/shared';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.TENANT_ADMIN, UserRole.SALES_MANAGER)
  @ApiOperation({ summary: 'List all users in the tenant' })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.usersService.findAll(user);
  }

  @Post()
  @Roles(UserRole.TENANT_ADMIN, UserRole.SALES_MANAGER)
  @ApiOperation({ summary: 'Create a new user/agent' })
  create(@CurrentUser() user: JwtPayload, @Body() createData: any) {
    return this.usersService.create(user, createData);
  }

  @Delete(':id')
  @Roles(UserRole.TENANT_ADMIN)
  @ApiOperation({ summary: 'Deactivate a user' })
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.usersService.remove(user, id);
  }

  @Get('audit-logs')
  @Roles(UserRole.TENANT_ADMIN)
  @ApiOperation({ summary: 'Retrieve system audit logs (Admins only)' })
  async getAuditLogs(
    @CurrentUser() user: JwtPayload,
    @Query('page') page = '1',
    @Query('limit') limit = '50',
    @Query('entity') entity?: string,
    @Query('action') action?: string,
  ) {
    return this.usersService.getAuditLogs(user, { page: +page, limit: +limit, entity, action });
  }
}
