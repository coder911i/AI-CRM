import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { JwtPayload } from '@waterting/shared';

@Controller('bookings/:bookingId/payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Param('bookingId') bookingId: string, @Body() data: any) {
    return this.paymentsService.create(user, bookingId, data);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload, @Param('bookingId') bookingId: string) {
    return this.paymentsService.findAllByBooking(user, bookingId);
  }

  @Patch(':id/record')
  recordPayment(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() data: any) {
    return this.paymentsService.recordPayment(user, id, data);
  }
}
