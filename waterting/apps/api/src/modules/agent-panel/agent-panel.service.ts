import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AgentPanelService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(agentId: string) {
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const [totalActive, overdue, flagged] = await Promise.all([
      this.prisma.allocationLog.count({ 
        where: { watertaingAgentId: agentId, status: { not: 'CLOSED' } } 
      }),
      this.prisma.allocationLog.count({
        where: { 
          watertaingAgentId: agentId, 
          updatedAt: { lt: fortyEightHoursAgo },
          status: { notIn: ['CLOSED', 'BOOKING_DONE'] }
        }
      }),
      this.prisma.allocationLog.count({
        where: { watertaingAgentId: agentId, fraudFlag: true }
      })
    ]);

    return { totalActive, overdue, flagged };
  }

  async getDeals(agentId: string) {
    return this.prisma.allocationLog.findMany({
      where: { watertaingAgentId: agentId },
      include: {
        lead: true,
        broker: true,
        visitSlots: true,
      },
      orderBy: { updatedAt: 'desc' }
    });
  }

  async flagDeal(id: string, agentId: string, note: string) {
    const deal = await this.prisma.allocationLog.findUnique({ where: { id } });
    if (!deal) throw new NotFoundException();
    if (deal.watertaingAgentId !== agentId) throw new ForbiddenException();

    return this.prisma.allocationLog.update({
      where: { id },
      data: { fraudFlag: true, fraudNote: note }
    });
  }

  async overrideBroker(id: string, agentId: string, brokerId: string) {
    const deal = await this.prisma.allocationLog.findUnique({ where: { id } });
    if (!deal) throw new NotFoundException();
    if (deal.watertaingAgentId !== agentId) throw new ForbiddenException();

    return this.prisma.allocationLog.update({
      where: { id },
      data: { brokerId, status: 'BROKER_ASSIGNED' }
    });
  }
}
