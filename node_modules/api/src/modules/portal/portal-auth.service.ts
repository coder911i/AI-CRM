import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class PortalAuthService {
  private otpStore = new Map<string, { code: string; expires: number }>();

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async requestOTP(email: string) {
    // 1. Verify buyer exists in CRM
    const booking = await this.prisma.booking.findFirst({
      where: { buyerEmail: email },
    });
    if (!booking) throw new UnauthorizedException('Access denied. No booking found for this email.');

    // 2. Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.otpStore.set(email, { code, expires: Date.now() + 600000 }); // 10 mins

    // 3. Send email via SMTP (Mocked)
    console.log(`[SMTP MOCK] OTP for ${email}: ${code}`);
    
    return { message: 'OTP sent successfully' };
  }

  async verifyOTP(email: string, code: string) {
    const stored = this.otpStore.get(email);
    if (!stored || stored.code !== code || stored.expires < Date.now()) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    this.otpStore.delete(email);

    // Get lead/booking info for JWT
    const booking = await this.prisma.booking.findFirst({
      where: { buyerEmail: email },
      include: { lead: true },
    });

    const payload = {
      sub: booking?.leadId,
      email,
      role: 'BUYER',
      tenantId: booking?.lead.tenantId,
    };

    return {
      token: this.jwt.sign(payload),
      bookingId: booking?.id,
    };
  }
}
