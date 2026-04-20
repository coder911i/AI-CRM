import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../../common/email/email.service';

@Injectable()
export class PortalAuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private emailService: EmailService,
  ) {}

  async requestOTP(email: string) {
    // 1. Verify buyer exists in CRM (check bookings OR leads)
    const [booking, lead] = await Promise.all([
      this.prisma.booking.findFirst({ where: { buyerEmail: email } }),
      this.prisma.lead.findFirst({ where: { email } }),
    ]);

    if (!booking && !lead) {
      throw new UnauthorizedException('Access denied. No account found for this email.');
    }

    // 2. Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 600000); // 10 mins

    await this.prisma.otpToken.create({
      data: { email, code, expires },
    });

    // 3. Send email via SMTP
    await this.emailService.sendOtp(email, code);
    
    return { message: 'OTP sent successfully' };
  }

  async verifyOTP(email: string, code: string) {
    const stored = await this.prisma.otpToken.findFirst({
      where: { email },
      orderBy: { createdAt: 'desc' },
    });

    if (!stored || stored.code !== code || new Date() > stored.expires) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    // Clean up used OTPs
    await this.prisma.otpToken.deleteMany({
      where: { email },
    });

    // 4. Resolve Identity (Booking prioritized over Lead)
    const booking = await this.prisma.booking.findFirst({
      where: { buyerEmail: email },
      include: { lead: true },
    });

    let tenantId = booking?.lead.tenantId;
    let sub = booking?.leadId;

    if (!booking) {
      const lead = await this.prisma.lead.findFirst({ where: { email } });
      tenantId = lead?.tenantId;
      sub = lead?.id;
    }

    const payload = {
      sub,
      email,
      role: 'BUYER',
      tenantId,
    };

    return {
      token: this.jwt.sign(payload),
      bookingId: booking?.id,
    };
  }
}
