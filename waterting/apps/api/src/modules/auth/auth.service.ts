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
    if (user && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload: JwtPayload = { sub: user.id, tenantId: user.tenantId, role: user.role as UserRole, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
      user: payload
    };
  }

  async register(registerDto: RegisterDto) {
    // Basic tenant and user creation for onboarding
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
    return {
      access_token: this.jwtService.sign(user),
      user,
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
