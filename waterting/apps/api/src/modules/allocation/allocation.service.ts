import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CommunicationService } from '../../common/comm/communication.service';
import { AllocationStatus } from '@prisma/client';

@Injectable()
export class AllocationService {
  constructor(
    private prisma: PrismaService,
    private comm: CommunicationService,
  ) {}

  async triggerAllocation(leadId: string, propertyId: string, action: string, tenantId: string) {
    // 1. Fetch data
    const [lead, property] = await Promise.all([
      this.prisma.lead.findUnique({ where: { id: leadId } }),
      this.prisma.property.findUnique({ where: { id: propertyId } }),
    ]);

    if (!lead || !property) throw new NotFoundException('Lead or Property not found');

    // 2. Select best broker
    const brokerId = await this.findBestBroker(property.assignedBrokerIds, tenantId);

    // 3. Round-robin assign Waterting agent
    const agentId = await this.findBestAgent(tenantId);

    // 4. Create AllocationLog and Slots in Transaction
    const allocation = await this.prisma.$transaction(async (tx) => {
      const log = await tx.allocationLog.create({
        data: {
          tenantId,
          propertyId,
          leadId,
          brokerId,
          ownerId: property.ownerId,
          watertaingAgentId: agentId,
          status: brokerId ? 'BROKER_ASSIGNED' : 'PENDING',
        },
        include: { broker: true, lead: true }
      });

      const suggestions = this.generateVisitSuggestions();
      await tx.visitSlot.createMany({
        data: suggestions.map(s => ({
          allocationId: log.id,
          proposedAt: s,
        }))
      });

      return log;
    });

    // 5. Parallel WA Notifications
    const notificationPromises = [];
    
    if (allocation.brokerId && allocation.broker) {
      notificationPromises.push(
        this.comm.sendWhatsApp(allocation.broker.phone, `New Lead Assigned!\nBuyer: ${lead.name}\nProperty: ${property.title}\nContact: ${lead.phone}\nAction REQUIRED: Contact buyer and schedule visit.`)
      );
    }

    // Notify Owner
    const owner = await this.prisma.user.findUnique({ where: { id: property.ownerId } });
    if (owner && owner.phone) {
      notificationPromises.push(
        this.comm.sendWhatsApp(owner.phone, `Lead Interest Alert!\nSomeone is interested in your property: ${property.title}\nBroker Assigned: ${allocation.broker?.name || 'Assigning soon'}\nWe'll update you on the visit status.`)
      );
    }

    // Notify Agent
    const agent = agentId ? await this.prisma.user.findUnique({ where: { id: agentId } }) : null;
    if (agent && agent.phone) {
      notificationPromises.push(
        this.comm.sendWhatsApp(agent.phone, `Supervision Task!\nYou've been assigned to supervise a new interest.\nLead: ${lead.name}\nBroker: ${allocation.broker?.name}\nProperty: ${property.id}`)
      );
    }

    await Promise.allSettled(notificationPromises);

    return this.prisma.allocationLog.findUnique({
      where: { id: allocation.id },
      include: { visitSlots: true, lead: true, broker: true }
    });
  }

  async findOne(id: string) {
    const allocation = await this.prisma.allocationLog.findUnique({
      where: { id },
      include: {
        lead: { include: { buyerPreference: true } },
        broker: true,
        visitSlots: true,
      }
    });
    if (!allocation) throw new NotFoundException('Allocation not found');
    return allocation;
  }

  async flagDeal(id: string, fraudNote: string) {
    return this.prisma.allocationLog.update({
      where: { id },
      data: { fraudFlag: true, fraudNote }
    });
  }

  async overrideBroker(id: string, brokerId: string) {
    return this.prisma.allocationLog.update({
      where: { id },
      data: { brokerId, status: 'BROKER_ASSIGNED' }
    });
  }

  async confirmSlot(allocationId: string, slotId: string, buyerId: string) {
    const [allocation, slot] = await Promise.all([
      this.prisma.allocationLog.findUnique({ 
        where: { id: allocationId },
        include: { lead: true, broker: true }
      }),
      this.prisma.visitSlot.findUnique({ where: { id: slotId } })
    ]);

    if (!allocation || !slot) throw new NotFoundException('Allocation or Slot not found');
    if (slot.allocationId !== allocationId) throw new BadRequestException('Slot does not belong to this allocation');

    await this.prisma.$transaction([
      this.prisma.visitSlot.update({
        where: { id: slotId },
        data: { isConfirmed: true, confirmedBy: buyerId }
      }),
      this.prisma.allocationLog.update({
        where: { id: allocationId },
        data: { status: 'VISIT_CONFIRMED' }
      })
    ]);

    // Send Confirmations (Phase 5 will add reminders)
    const property = await this.prisma.property.findUnique({ where: { id: allocation.propertyId || '' } });
    const message = `Visit CONFIRMED!\nDate: ${slot.proposedAt.toLocaleString()}\nProperty: ${property?.title}\nAddress: ${property?.address || property?.location}`;

    await Promise.allSettled([
      this.comm.sendWhatsApp(allocation.lead.phone, message),
      allocation.broker ? this.comm.sendWhatsApp(allocation.broker.phone, `Buyer confirmed visit!\nLead: ${allocation.lead.name}\nTime: ${slot.proposedAt.toLocaleString()}`) : null,
    ]);

    return { success: true, confirmedAt: slot.proposedAt };
  }

  private async findBestBroker(assignedBrokerIds: string[], tenantId: string): Promise<string | null> {
    if (!assignedBrokerIds || assignedBrokerIds.length === 0) return null;

    // Pick broker with highest rating and lowest active load
    const brokers = await this.prisma.broker.findMany({
      where: {
        id: { in: assignedBrokerIds },
        tenantId,
        isActive: true,
      },
      include: {
        _count: {
          select: { allocationLogs: { where: { status: { not: 'CLOSED' } } } }
        }
      } as any
    });

    if (brokers.length === 0) return null;

    // Simplified selection logic: lowest active log count
    // (In reality, would also look at commissionPct or rating)
    return (brokers as any[]).sort((a, b) => a._count.allocationLogs - b._count.allocationLogs)[0].id;
  }

  private async findBestAgent(tenantId: string): Promise<string | null> {
    const agents = await this.prisma.user.findMany({
      where: {
        tenantId,
        role: 'SALES_AGENT',
        isActive: true,
      },
      include: {
        _count: {
          select: { allocationLogs: { where: { status: { not: 'CLOSED' } } } }
        }
      } as any
    });

    if (agents.length === 0) return null;

    // Round-robin: pick the one with the fewest active supervisions
    return (agents as any[]).sort((a, b) => a._count.allocationLogs - b._count.allocationLogs)[0].id;
  }

  private generateVisitSuggestions(): Date[] {
    const suggestions: Date[] = [];
    const now = new Date();
    
    // Simple logic: Next 3 weekdays at 11am, 3pm, 5pm
    let date = new Date(now);
    for (let i = 0; i < 3; i++) {
      date.setDate(date.getDate() + 1);
      // Skip weekend
      while (date.getDay() === 0 || date.getDay() === 6) {
        date.setDate(date.getDate() + 1);
      }
      
      const hour = i === 0 ? 11 : i === 1 ? 15 : 17;
      const s = new Date(date);
      s.setHours(hour, 0, 0, 0);
      suggestions.push(s);
    }
    return suggestions;
  }
}
