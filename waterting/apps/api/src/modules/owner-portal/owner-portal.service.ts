import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class OwnerPortalService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(ownerId: string, tenantId: string) {
    const [propertyCount, activeInquiries, visitsThisWeek] = await Promise.all([
      this.prisma.property.count({ where: { ownerId, tenantId } }),
      this.prisma.allocationLog.count({ 
        where: { ownerId, status: { not: 'CLOSED' } } 
      }),
      this.prisma.visitSlot.count({
        where: { 
          allocation: { ownerId },
          proposedAt: { 
            gte: new Date(), 
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 
          },
          isConfirmed: true
        }
      })
    ]);

    return { propertyCount, activeInquiries, visitsThisWeek };
  }

  async getProperties(ownerId: string) {
    return this.prisma.property.findMany({
      where: { ownerId },
      include: {
        _count: { select: { visits: true } }
      }
    });
  }

  async createProperty(ownerId: string, tenantId: string, data: any) {
    return this.prisma.property.create({
      data: {
        ...data,
        ownerId,
        tenantId,
      }
    });
  }

  async updateProperty(id: string, ownerId: string, data: any) {
    const property = await this.prisma.property.findUnique({ where: { id } });
    if (!property) throw new NotFoundException();
    if (property.ownerId !== ownerId) throw new ForbiddenException();

    return this.prisma.property.update({
      where: { id },
      data
    });
  }

  async deleteProperty(id: string, ownerId: string) {
    const property = await this.prisma.property.findUnique({ where: { id } });
    if (!property) throw new NotFoundException();
    if (property.ownerId !== ownerId) throw new ForbiddenException();

    return this.prisma.property.update({
      where: { id },
      data: { status: 'INACTIVE' }
    });
  }

  async getLeads(ownerId: string) {
    return this.prisma.allocationLog.findMany({
      where: { ownerId },
      include: {
        lead: { select: { name: true, phone: true, email: true, budgetMin: true, budgetMax: true } },
        broker: { select: { name: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getVisits(ownerId: string) {
    return this.prisma.visitSlot.findMany({
      where: {
        allocation: { ownerId }
      },
      include: {
        allocation: {
          include: {
            lead: true,
            broker: true
          }
        }
      },
      orderBy: { proposedAt: 'asc' }
    });
  }

  async rateBroker(ownerId: string, allocationId: string, rating: number, comment: string) {
    // Implement broker rating logic
    return { success: true };
  }
}
