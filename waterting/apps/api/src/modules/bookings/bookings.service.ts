import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtPayload, BookingStatus, UnitStatus, ActivityType } from '@waterting/shared';
import { AuditService } from '../../common/audit/audit.service';
import { AutomationsService } from '../automations/automations.service';

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private automationsService: AutomationsService,
  ) {}

  async create(user: JwtPayload, data: any) {
    // transaction to secure unit
    return this.prisma.$transaction(async (prisma) => {
      const unit = await prisma.unit.findFirst({
        where: { id: data.unitId },
        include: { tower: { include: { project: true } } },
      });

      if (!unit || unit.tower.project.tenantId !== user.tenantId) {
        throw new NotFoundException('Unit not found');
      }
      
      if (unit.status !== UnitStatus.AVAILABLE && unit.status !== UnitStatus.RESERVED) {
        throw new BadRequestException('Unit is not available for booking');
      }

      const booking = await prisma.booking.create({
        data: {
          ...data,
          status: BookingStatus.INITIATED,
        },
      });

      await prisma.unit.update({
        where: { id: unit.id },
        data: { status: UnitStatus.BOOKED },
      });

      // Audit Log for Booking Creation
      await this.audit.log({
        tenantId: user.tenantId,
        userId: user.sub,
        action: 'CREATE',
        entity: 'Booking',
        entityId: booking.id,
        newData: {
          unitId: data.unitId,
          leadId: data.leadId,
          bookingAmount: data.bookingAmount,
          buyerName: data.buyerName,
        },
      });

      // Auto-calculate commission if broker referred this lead
      const lead = await prisma.lead.findUnique({ where: { id: data.leadId } });
      
      // 1. Broker Commission
      if (lead?.brokerId) {
        const broker = await prisma.broker.findUnique({ where: { id: lead.brokerId } });
        if (broker) {
          await prisma.commission.create({
            data: {
              brokerId: broker.id,
              bookingId: booking.id,
              amount: booking.bookingAmount * (broker.commissionPct / 100),
            },
          });
        }
      }

      // 2. Sales Agent Commission (Internal - 1% flat for this demo)
      if (lead?.assignedToId) {
        await prisma.commission.create({
          data: {
            userId: lead.assignedToId,
            bookingId: booking.id,
            amount: booking.bookingAmount * 0.01,
          },
        });
      }

      await this.automationsService.evaluateAutomations(user.tenantId, 'BOOKING_CREATED', { 
        leadId: booking.leadId, 
        email: lead?.email, 
        phone: lead?.phone,
        bookingId: booking.id,
        unitNumber: unit.unitNumber,
        projectName: unit.tower.project.name
      });

      return booking;
    });
  }

  async findAll(user: JwtPayload, page = 1, limit = 50) {
    // Retrieve all bookings for the tenant
    return this.prisma.booking.findMany({
      where: { lead: { tenantId: user.tenantId } },
      take: limit,
      skip: (page - 1) * limit,
      include: {
        unit: { include: { tower: { include: { project: true } } } },
        lead: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(user: JwtPayload, id: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { id, lead: { tenantId: user.tenantId } },
      include: { 
        payments: true, 
        commissions: true, 
        unit: true, 
        lead: true,
        coBuyers: true,
        refunds: true,
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async schedulePayments(user: JwtPayload, id: string, payments: any[]) {
    const booking = await this.prisma.booking.findFirst({
      where: { id, unit: { tower: { project: { tenantId: user.tenantId } } } },
    });
    if (!booking) throw new NotFoundException('Booking not found');

    return this.prisma.$transaction(async (prisma) => {
      // Delete existing unpaid payments
      await prisma.payment.deleteMany({
        where: { bookingId: id, paidAt: null },
      });

      return prisma.payment.createMany({
        data: payments.map(p => ({
          ...p,
          bookingId: id,
          dueDate: new Date(p.dueDate),
        })),
      });
    });
  }

  async recordPayment(user: JwtPayload, id: string, paymentId: string, data: any) {
    const booking = await this.prisma.booking.findFirst({
      where: { id, unit: { tower: { project: { tenantId: user.tenantId } } } },
    });
    if (!booking) throw new NotFoundException('Booking not found');

    return this.prisma.payment.update({
      where: { id: paymentId, bookingId: id },
      data: {
        ...data,
        paidAt: data.paidAt ? new Date(data.paidAt) : new Date(),
      },
    });
  }

  async createRefund(user: JwtPayload, id: string, data: { amount: number; reason?: string }) {
    const booking = await this.prisma.booking.findFirst({
      where: { id, lead: { tenantId: user.tenantId } },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (data.amount > booking.bookingAmount) {
      throw new BadRequestException('Refund amount cannot exceed booking amount');
    }

    const refund = await this.prisma.refund.create({
      data: {
        bookingId: id,
        amount: data.amount,
        reason: data.reason,
        status: 'PENDING',
      },
    });

    await this.audit.log({
      tenantId: user.tenantId,
      userId: user.sub,
      action: 'CREATE_REFUND',
      entity: 'Refund',
      entityId: refund.id,
      newData: refund,
    });

    return refund;
  }
}
