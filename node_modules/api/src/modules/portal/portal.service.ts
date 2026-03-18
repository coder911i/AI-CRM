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

  async getDashboard(email: string) {
    const bookings = await this.prisma.booking.findMany({
      where: { buyerEmail: email },
      include: {
        unit: { include: { tower: { include: { project: true } } } },
        payments: { orderBy: { dueDate: 'asc' } },
      },
    });

    return { bookings };
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
    // In production, these would be R2 signed URLs
    return bookings.map(b => ({
      bookingId: b.id,
      documents: (b as any).lead?.activities || []
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
