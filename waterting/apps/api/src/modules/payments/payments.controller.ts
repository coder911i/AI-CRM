import { Controller, Get, Post, Patch, Body, Param, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { JwtPayload } from '@waterting/shared';

@Controller('bookings/:bookingId/payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private prisma: PrismaService,
  ) {}

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

  @Get('export/csv')
  async exportPayments(@CurrentUser() user: JwtPayload, @Param('bookingId') bookingId: string, @Res() res: Response) {
    const payments = await this.prisma.payment.findMany({
      where: { bookingId },
      orderBy: { dueDate: 'asc' }
    });
    const header = 'Description,Due Date,Amount,Status,Paid At,Method,UTR\n';
    const rows = payments.map((p: any) => 
      `"${p.description}","${p.dueDate.toLocaleDateString('en-IN')}",${p.amount},"${p.paidAt ? 'PAID' : 'DUE'}","${p.paidAt?.toLocaleDateString('en-IN') || ''}","${p.method || ''}","${p.utr || ''}"`
    ).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=payments.csv');
    res.send(header + rows);
  }
}
