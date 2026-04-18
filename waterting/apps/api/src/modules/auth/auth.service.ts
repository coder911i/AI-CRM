import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtPayload, UserRole } from '@waterting/shared';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
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
    const user = await this.prisma.user.findFirst({ where: { email: loginDto.email } });
    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    if (!user.isActive) {
      throw new UnauthorizedException('Your account has been suspended. Please contact your administrator.');
    }

    const payload: JwtPayload = { sub: user.id, tenantId: user.tenantId, role: user.role as UserRole, email: user.email };

    // Audit login event
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

    return {
      access_token: this.jwtService.sign(payload),
      user: { ...payload, name: user.name },
    };
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

    return {
      access_token: this.jwtService.sign(payload),
      user: payload
    };
  }

  async refresh(user: JwtPayload) {
    // Re-fetch user to get latest role/status
    const dbUser = await this.prisma.user.findUnique({ where: { id: user.sub } });
    if (!dbUser || !dbUser.isActive) {
      throw new UnauthorizedException('Account no longer active');
    }
    const payload: JwtPayload = {
      sub: dbUser.id,
      tenantId: dbUser.tenantId,
      role: dbUser.role as UserRole,
      email: dbUser.email,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: { ...payload, name: dbUser.name },
    };
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
