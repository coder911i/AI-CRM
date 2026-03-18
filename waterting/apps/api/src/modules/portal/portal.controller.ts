import { Controller, Post, Get, Body } from '@nestjs/common';
import { PortalService } from './portal.service';
import { Public } from '../../common/decorators/public.decorator';

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
  getDashboard(@Body('email') email: string) {
    return this.portalService.getDashboard(email);
  }

  @Get('payments')
  getPayments(@Body('email') email: string) {
    return this.portalService.getPayments(email);
  }
}
