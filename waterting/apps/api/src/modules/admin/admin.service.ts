import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getUsers(tenantId: string) {
    return this.prisma.user.findMany({
      where: { tenantId },
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true }
    });
  }

  async createUser(tenantId: string, data: any) {
    const hashedPassword = await bcrypt.hash(data.password || 'Waterting@123', 10);
    return this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        tenantId,
      }
    });
  }

  async updateUser(id: string, tenantId: string, data: any) {
    const user = await this.prisma.user.findFirst({ where: { id, tenantId } });
    if (!user) throw new NotFoundException('User not found');
    
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data
    });
  }

  async getKycList(tenantId: string) {
    // KYC logic not fully in schema, returning placeholder
    return [];
  }

  async getProperties(tenantId: string) {
    return this.prisma.property.findMany({
      where: { tenantId },
      include: { owner: { select: { name: true, email: true } } }
    });
  }

  async getAllDeals(tenantId: string) {
    return this.prisma.allocationLog.findMany({
      where: { tenantId },
      include: {
        lead: true,
        broker: true,
        visitSlots: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getAnalytics(tenantId: string) {
    const [totalLeads, bookings] = await Promise.all([
      this.prisma.lead.count({ where: { tenantId } }),
      this.prisma.booking.count({ where: { lead: { tenantId } } })
    ]);

    return {
      totalLeads,
      totalBookings: bookings,
      conversionRate: totalLeads > 0 ? (bookings / totalLeads) * 100 : 0
    };
  }
}
