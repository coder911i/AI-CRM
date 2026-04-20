import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';

@Injectable()
export class PortalService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async getDashboard(email: string, leadId: string) {
    // Resolve user by email since wishlist/tickets use User ID
    const user = await this.prisma.user.findFirst({
      where: { email },
      select: { id: true }
    });

    const [bookings, visits, wishlist] = await Promise.all([
      this.prisma.booking.findMany({
        where: { buyerEmail: email },
        include: {
          unit: { include: { tower: { include: { project: true } } } },
          payments: { orderBy: { dueDate: 'asc' } },
        },
      }),
      this.prisma.siteVisit.findMany({
        where: { leadId },
        include: { agent: true, lead: { include: { project: true } } },
      }),
      user ? this.prisma.wishlist.findMany({
        where: { userId: user.id },
        include: { project: true, property: true },
      }) : [],
    ]);

    return { bookings, visits, wishlist };
  }

  // Wishlist
  async getWishlist(leadId: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
    const user = lead?.email ? await this.prisma.user.findFirst({ where: { email: lead.email } }) : null;
    if (!user) return [];

    return this.prisma.wishlist.findMany({
      where: { userId: user.id },
      include: { project: true, property: true },
    });
  }

  async addToWishlist(leadId: string, projectId?: string, propertyId?: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
    const user = lead?.email ? await this.prisma.user.findFirst({ where: { email: lead.email } }) : null;
    if (!user) throw new NotFoundException('User profile not found for this lead');

    return this.prisma.wishlist.create({
      data: { userId: user.id, projectId, propertyId },
    });
  }

  async removeFromWishlist(id: string, leadId: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
    const user = lead?.email ? await this.prisma.user.findFirst({ where: { email: lead.email } }) : null;
    if (!user) throw new UnauthorizedException();

    return this.prisma.wishlist.delete({
      where: { id, userId: user.id },
    });
  }

  // Support Tickets
  async getTickets(leadId: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
    const user = lead?.email ? await this.prisma.user.findFirst({ where: { email: lead.email } }) : null;
    if (!user) return [];

    return this.prisma.supportTicket.findMany({
      where: { userId: user.id },
      include: { messages: { orderBy: { createdAt: 'desc' } } },
    });
  }

  async createTicket(leadId: string, tenantId: string, subject: string, description: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
    const user = lead?.email ? await this.prisma.user.findFirst({ where: { email: lead.email } }) : null;
    if (!user) throw new NotFoundException('User profile not found');

    return this.prisma.supportTicket.create({
      data: { userId: user.id, tenantId, subject, description },
    });
  }

  async addTicketMessage(ticketId: string, leadId: string, message: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
    const user = lead?.email ? await this.prisma.user.findFirst({ where: { email: lead.email } }) : null;
    if (!user) throw new UnauthorizedException();

    return this.prisma.ticketMessage.create({
      data: { ticketId, userId: user.id, message, isAdmin: false },
    });
  }

  // Site Visits
  async getVisits(leadId: string) {
    return this.prisma.siteVisit.findMany({
      where: { leadId },
      include: { agent: true, lead: { include: { project: true } } },
    });
  }

  // Recommendations (Placeholder for Groq)
  async getRecommendations(leadId: string) {
    const lead = await this.prisma.lead.findUnique({ 
      where: { id: leadId },
      include: { project: true }
    });
    if (!lead) return [];

    // Find other projects in the same tenant that are active
    return this.prisma.project.findMany({
      where: { 
        tenantId: lead.tenantId, 
        status: 'ACTIVE',
        id: { not: lead.projectId || undefined }
      },
      take: 3,
    });
  }

  async getPayments(email: string) {
    const bookings = await this.prisma.booking.findMany({
      where: { buyerEmail: email },
      include: { payments: { orderBy: { dueDate: 'asc' } } },
    });

    return bookings.flatMap((b) => b.payments);
  }

  async getDocuments(email: string) {
    const bookings = await this.prisma.booking.findMany({
      where: { buyerEmail: email },
      include: { 
        lead: { include: { activities: { where: { type: 'DOCUMENT_SHARED' } } } }
      },
    });
    return bookings.map(b => ({
      bookingId: b.id,
      documents: b.lead?.activities || []
    }));
  }

  async getProperty(email: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { buyerEmail: email },
      include: {
        unit: { include: { tower: { include: { project: true } } } }
      }
    });
    if (!booking) throw new NotFoundException();
    return booking.unit;
  }
}
