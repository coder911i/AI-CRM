import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';

@Injectable()
export class PortalService {
  private otpStore = new Map<string, { otp: string; expiresAt: number }>();

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async requestOtp(email: string) {
    // Find booking by buyer email
    const booking = await this.prisma.booking.findFirst({
      where: { buyerEmail: email },
    });
    if (!booking) throw new NotFoundException('No booking found for this email');

    const otp = crypto.randomInt(100000, 999999).toString();
    this.otpStore.set(email, { otp, expiresAt: Date.now() + 10 * 60 * 1000 }); // 10 min

    // In production, send via email service
    // For now, return OTP in dev mode
    return { message: 'OTP sent to your email', ...(process.env.NODE_ENV !== 'production' ? { otp } : {}) };
  }

  async verifyOtp(email: string, otp: string) {
    const stored = this.otpStore.get(email);
    if (!stored || stored.otp !== otp || stored.expiresAt < Date.now()) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    this.otpStore.delete(email);

    const token = this.jwtService.sign({ email, type: 'portal' });
    return { access_token: token };
  }

  async getDashboard(email: string, leadId: string) {
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
      this.prisma.wishlist.findMany({
        where: { userId: leadId }, // Wait, Wishlist uses userId. Our sub is leadId.
        include: { project: true, property: true },
      }),
    ]);

    return { bookings, visits, wishlist };
  }

  // Wishlist
  async getWishlist(leadId: string) {
    return this.prisma.wishlist.findMany({
      where: { userId: leadId },
      include: { project: true, property: true },
    });
  }

  async addToWishlist(leadId: string, projectId?: string, propertyId?: string) {
    return this.prisma.wishlist.create({
      data: { userId: leadId, projectId, propertyId },
    });
  }

  async removeFromWishlist(id: string, leadId: string) {
    return this.prisma.wishlist.delete({
      where: { id, userId: leadId },
    });
  }

  // Support Tickets
  async getTickets(leadId: string) {
    return this.prisma.supportTicket.findMany({
      where: { userId: leadId },
      include: { messages: { orderBy: { createdAt: 'desc' } } },
    });
  }

  async createTicket(leadId: string, tenantId: string, subject: string, description: string) {
    return this.prisma.supportTicket.create({
      data: { userId: leadId, tenantId, subject, description },
    });
  }

  async addTicketMessage(ticketId: string, leadId: string, message: string) {
    return this.prisma.ticketMessage.create({
      data: { ticketId, userId: leadId, message, isAdmin: false },
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
