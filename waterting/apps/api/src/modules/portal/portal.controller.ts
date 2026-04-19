import { Controller, Post, Get, Body, UseGuards, Request, Param } from '@nestjs/common';
import { PortalService } from './portal.service';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('portal')
@ApiBearerAuth('JWT-auth')
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
    return this.portalService.getDashboard(req.user.email, req.user.sub);
  }

  @Get('wishlist')
  @UseGuards(JwtAuthGuard)
  getWishlist(@Request() req: any) {
    return this.portalService.getWishlist(req.user.sub);
  }

  @Post('wishlist')
  @UseGuards(JwtAuthGuard)
  addToWishlist(@Request() req: any, @Body() body: { projectId?: string; propertyId?: string }) {
    return this.portalService.addToWishlist(req.user.sub, body.projectId, body.propertyId);
  }

  @Get('tickets')
  @UseGuards(JwtAuthGuard)
  getTickets(@Request() req: any) {
    return this.portalService.getTickets(req.user.sub);
  }

  @Post('tickets')
  @UseGuards(JwtAuthGuard)
  createTicket(@Request() req: any, @Body() body: { subject: string; description: string }) {
    return this.portalService.createTicket(req.user.sub, req.user.tenantId, body.subject, body.description);
  }

  @Post('tickets/:id/messages')
  @UseGuards(JwtAuthGuard)
  addMessage(@Request() req: any, @Body('message') message: string, @Body('id') id: string) {
    return this.portalService.addTicketMessage(id, req.user.sub, message);
  }

  @Get('visits')
  @UseGuards(JwtAuthGuard)
  getVisits(@Request() req: any) {
    return this.portalService.getVisits(req.user.sub);
  }

  @Get('recommendations')
  @UseGuards(JwtAuthGuard)
  getRecommendations(@Request() req: any) {
    return this.portalService.getRecommendations(req.user.sub);
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
