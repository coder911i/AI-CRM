import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { PortalService } from './portal.service';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('portal')
export class PortalController {
  constructor(private readonly portalService: PortalService) {}

  @Public()
  @Post('auth/request-otp')
  requestOtp(@Body('email') email: string) {
    return this.portalService.requestOtp(email);
  }

  @Public()
  @Post('auth/verify-otp')
  verifyOtp(@Body('email') email: string, @Body('otp') otp: string) {
    return this.portalService.verifyOtp(email, otp);
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  getDashboard(@Request() req: any) {
    return this.portalService.getDashboard(req.user.email);
  }

  @Get('payments')
  @UseGuards(JwtAuthGuard)
  getPayments(@Request() req: any) {
    return this.portalService.getPayments(req.user.email);
  }

  @Get('documents')
  @UseGuards(JwtAuthGuard)
  getDocuments(@Request() req: any) {
    return this.portalService.getDocuments(req.user.email);
  }

  @Get('property')
  @UseGuards(JwtAuthGuard)
  getProperty(@Request() req: any) {
    return this.portalService.getProperty(req.user.email);
  }
}
