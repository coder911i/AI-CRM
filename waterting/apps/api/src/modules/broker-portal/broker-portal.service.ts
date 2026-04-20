import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class BrokerPortalService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(brokerId: string) {
    const [assignedLeads, upcomingVisits, commissionStats] = await Promise.all([
      this.prisma.allocationLog.count({ where: { brokerId, status: { not: 'CLOSED' } } }),
      this.prisma.visitSlot.count({
        where: { 
          allocation: { brokerId },
          proposedAt: { gte: new Date() },
          isConfirmed: true
        }
      }),
      this.prisma.commission.aggregate({
        where: { brokerId },
        _sum: { amount: true }
      })
    ]);

    // Get broker rating
    const broker = await this.prisma.broker.findUnique({ 
      where: { id: brokerId },
      select: { commissionPct: true } 
    });

    return {
      assignedLeadsToday: assignedLeads,
      upcomingVisits,
      commissionPipeline: commissionStats._sum.amount || 0,
      rating: 4.5, // Mocked rating for now
    };
  }

  async getLeads(brokerId: string) {
    return this.prisma.allocationLog.findMany({
      where: { brokerId },
      include: {
        lead: { 
          include: { 
            buyerPreference: true 
          } 
        },
        visitSlots: true
      },
      orderBy: { updatedAt: 'desc' }
    });
  }

  async getLeadDetail(allocationId: string, brokerId: string) {
    const allocation = await this.prisma.allocationLog.findUnique({
      where: { id: allocationId },
      include: {
        lead: { include: { buyerPreference: true } },
        visitSlots: true,
      }
    });

    if (!allocation) throw new NotFoundException();
    if (allocation.brokerId !== brokerId) throw new ForbiddenException();

    return allocation;
  }

  async updateVisitOutcome(visitId: string, brokerId: string, dto: any) {
    const slot = await this.prisma.visitSlot.findUnique({
      where: { id: visitId },
      include: { allocation: true }
    });

    if (!slot) throw new NotFoundException();
    if (slot.allocation.brokerId !== brokerId) throw new ForbiddenException();

    // Update allocation status based on outcome
    const newStatus = dto.outcome === 'INTERESTED' ? 'IN_NEGOTIATION' : 'CLOSED';
    
    await this.prisma.allocationLog.update({
      where: { id: slot.allocationId },
      data: { status: newStatus }
    });

    // In a real app, you'd also record the visit outcome details in a Visit entity
    return { success: true, status: newStatus };
  }

  async getCommissions(brokerId: string) {
    return this.prisma.commission.findMany({
      where: { brokerId },
      include: {
        booking: {
          include: {
            unit: { include: { tower: { include: { project: true } } } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}
