import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { RefundsService } from './refunds.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { JwtPayload, UserRole } from '@waterting/shared';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('financials')
@ApiBearerAuth('JWT-auth')
@Controller('refunds')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RefundsController {
  constructor(private readonly refundsService: RefundsService) {}

  @Post()
  @ApiOperation({ summary: 'Request a refund for a booking' })
  @Roles(UserRole.TENANT_ADMIN, UserRole.SALES_MANAGER)
  request(@CurrentUser() user: JwtPayload, @Body() data: { bookingId: string; amount: number; reason: string }) {
    return this.refundsService.requestRefund(user, data.bookingId, data.amount, data.reason);
  }

  @Patch(':id/process')
  @Roles(UserRole.TENANT_ADMIN, UserRole.ACCOUNTS)
  process(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() data: { referenceNumber: string }) {
    return this.refundsService.processRefund(user, id, data.referenceNumber);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.refundsService.findAll(user);
  }
}
