import { Controller, Post, Body, UseGuards, Get, Request, Res, Query, Patch, Param, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { JwtPayload, UserRole } from '@waterting/shared';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from '../../common/prisma/prisma.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(loginDto);
    
    res.cookie('auth_token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@CurrentUser() user: JwtPayload) {
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  refresh(@CurrentUser() user: JwtPayload) {
    return this.authService.refresh(user);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('auth_token');
    return { message: 'Logged out successfully' };
  }

  @Post('create-staff')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TENANT_ADMIN, UserRole.SALES_MANAGER)
  async createStaff(@Body() dto: any, @Request() req: any) {
    return this.authService.createStaff(dto, req.user.tenantId);
  }

  @Get('staff')
  @UseGuards(JwtAuthGuard)
  async getStaff(@Request() req: any) {
    return this.prisma.user.findMany({
      where: {
        tenantId: req.user.tenantId,
        isActive: true,
        role: { in: ['SALES_AGENT', 'SALES_MANAGER'] },
      },
      select: { id: true, name: true, email: true, role: true, agentCode: true, phone: true },
      orderBy: { name: 'asc' },
    });
  }

  @Get('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TENANT_ADMIN, UserRole.SALES_MANAGER)
  async getAllUsers(@Request() req: any) {
    return this.prisma.user.findMany({
      where: { tenantId: req.user.tenantId },
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true, agentCode: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Patch('users/:id/toggle-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TENANT_ADMIN)
  async toggleUserStatus(@Param('id') id: string, @Request() req: any) {
    const user = await this.prisma.user.findFirst({
      where: { id, tenantId: req.user.tenantId },
    });
    if (!user) throw new NotFoundException('User not found');
    return this.prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: { id: true, name: true, isActive: true },
    });
  }
}
