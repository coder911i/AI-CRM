import { Controller, Get, Post, Body, Param, UseGuards, Res, Query, NotFoundException, Patch } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { JwtPayload, UserRole } from '@waterting/shared';
import { PrismaService } from '../../common/prisma/prisma.service';

import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('bookings')
@ApiBearerAuth('JWT-auth')
@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingsController {
  constructor(
    private readonly bookingsService: BookingsService,
    private prisma: PrismaService,
  ) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() createBookingDto: any) {
    return this.bookingsService.create(user, createBookingDto);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.bookingsService.findAll(user, Number(page || 1), Number(limit || 50));
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.bookingsService.findOne(user, id);
  }

  @Post(':id/schedule')
  schedule(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body('payments') payments: any[]) {
    return this.bookingsService.schedulePayments(user, id, payments);
  }

  @Post(':id/payments/:paymentId')
  recordPayment(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Param('paymentId') paymentId: string, @Body() data: any) {
    return this.bookingsService.recordPayment(user, id, paymentId, data);
  }

  @Get(':id/payments/export')
  async exportPayments(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Res() res: any) {
    const booking = await this.bookingsService.findOne(user, id);
    const header = 'Amount,Due Date,Paid At,Method,Reference\n';
    const rows = booking.payments.map((p: any) =>
      `${p.amount},${p.dueDate},${p.paidAt ?? ''},${p.method ?? ''},${p.referenceNumber ?? ''}`
    ).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=booking-${id}-payments.csv`);
    res.send(header + rows);
  }

  @Post(':id/refunds')
  @UseGuards(RolesGuard)
  @Roles(UserRole.TENANT_ADMIN, UserRole.ACCOUNTS)
  createRefund(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() data: { amount: number; reason?: string }) {
    return this.bookingsService.createRefund(user, id, data);
  }

  @Get(':id/refunds')
  async getRefunds(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const booking = await this.prisma.booking.findFirst({
      where: { id, lead: { tenantId: user.tenantId } },
      include: { refunds: { orderBy: { createdAt: 'desc' } } },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking.refunds;
  }

  @Patch('refunds/:refundId/process')
  @Roles(UserRole.ACCOUNTS, UserRole.TENANT_ADMIN)
  @ApiOperation({ summary: 'Process a pending refund' })
  async processRefund(
    @Param('refundId') refundId: string, 
    @Body() dto: { referenceNumber: string; processedAt: string }, 
    @CurrentUser() user: JwtPayload
  ) {
    return this.prisma.refund.update({
      where: { id: refundId },
      data: { status: 'PROCESSED', referenceNumber: dto.referenceNumber, processedAt: new Date(dto.processedAt) },
    });
  }

  @Patch('refunds/:refundId/reject')
  @Roles(UserRole.ACCOUNTS, UserRole.TENANT_ADMIN)
  @ApiOperation({ summary: 'Reject a pending refund request' })
  async rejectRefund(
    @Param('refundId') refundId: string, 
    @Body() dto: { reason: string }, 
    @CurrentUser() user: JwtPayload
  ) {
    return this.prisma.refund.update({
      where: { id: refundId },
      data: { status: 'REJECTED', reason: dto.reason },
    });
  }
}
