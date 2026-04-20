import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { RedisService } from '../../common/redis/redis.service';
import { JwtPayload, UserRole } from '@waterting/shared';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private redis: RedisService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findFirst({ where: { email } });
    if (!user) return null;
    if (!user.isActive) return null;
    if (await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    try {
      const user = await this.prisma.user.findFirst({ where: { email: loginDto.email } });
      if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
        throw new UnauthorizedException('Invalid email or password');
      }
      if (!user.isActive) {
        throw new UnauthorizedException('Your account has been suspended. Please contact your administrator.');
      }

      const payload: JwtPayload = { sub: user.id, tenantId: user.tenantId, role: user.role as any, email: user.email };

      // Audit login event - Wrapped in a silent catch to prevent login failure if audit fails
      try {
        await this.prisma.auditLog.create({
          data: {
            tenantId: user.tenantId,
            userId: user.id,
            action: 'LOGIN',
            entity: 'User',
            entityId: user.id,
            newData: { email: user.email, role: user.role },
          },
        });
      } catch (auditError) {
        console.error('Audit Log failed but proceeding with login:', auditError);
      }

      const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
      const refreshToken = uuidv4();

      // Store refresh token in Redis for 7 days
      await this.redis.set(`refresh_token:${refreshToken}`, user.id, 7 * 24 * 60 * 60);

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: { 
          id: user.id,
          sub: user.id,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId,
          name: user.name 
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      console.error('Login error:', error);
      throw new BadRequestException('An unexpected error occurred during login. Please try again.');
    }
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findFirst({ where: { email: registerDto.email }});
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    
    // Create Tenant and Admin User in a transaction
    const tenantAndUser = await this.prisma.$transaction(async (prisma) => {
      const tenant = await prisma.tenant.create({
        data: { name: registerDto.tenantName },
      });

      const user = await prisma.user.create({
        data: {
          email: registerDto.email,
          password: hashedPassword,
          name: registerDto.name,
          role: UserRole.TENANT_ADMIN,
          tenantId: tenant.id,
        },
      });

      return { tenant, user };
    });

    const payload: JwtPayload = { 
      sub: tenantAndUser.user.id, 
      tenantId: tenantAndUser.tenant.id, 
      role: tenantAndUser.user.role as UserRole, 
      email: tenantAndUser.user.email 
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = uuidv4();
    await this.redis.set(`refresh_token:${refreshToken}`, tenantAndUser.user.id, 7 * 24 * 60 * 60);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: payload
    };
  }

  async refresh(refreshToken: string) {
    const userId = await this.redis.get(`refresh_token:${refreshToken}`);
    if (!userId) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) {
      await this.redis.del(`refresh_token:${refreshToken}`);
      throw new UnauthorizedException('Account no longer active');
    }

    // Rotate refresh token
    await this.redis.del(`refresh_token:${refreshToken}`);
    const newRefreshToken = uuidv4();
    await this.redis.set(`refresh_token:${newRefreshToken}`, user.id, 7 * 24 * 60 * 60);

    const payload: JwtPayload = {
      sub: user.id,
      tenantId: user.tenantId,
      role: user.role as UserRole,
      email: user.email,
    };

    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '15m' }),
      refresh_token: newRefreshToken,
      user: { ...payload, name: user.name },
    };
  }

  async revokeRefreshToken(refreshToken: string) {
    await this.redis.del(`refresh_token:${refreshToken}`);
  }

  async createStaff(dto: any, tenantId: string) {
    const existing = await this.prisma.user.findFirst({ where: { email: dto.email }});
    if (existing) {
      throw new BadRequestException('User already exists');
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        role: dto.role || 'SALES_AGENT',
        tenantId,
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });
  }
}
