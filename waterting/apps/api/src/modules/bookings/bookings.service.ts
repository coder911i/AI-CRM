import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtPayload, BookingStatus, UnitStatus } from '@waterting/shared';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

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

      // Auto-calculate commission if broker referred this lead
      const lead = await prisma.lead.findUnique({ where: { id: data.leadId } });
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

      return booking;
    });
  }

  async findAll(user: JwtPayload) {
    // Retrieve all bookings for the tenant
    return this.prisma.booking.findMany({
      where: { lead: { tenantId: user.tenantId } },
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
      include: { payments: true, commissions: true, unit: true, lead: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }
}
