import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { JwtPayload } from '@waterting/shared';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('funnel')
  getFunnel(@CurrentUser() user: JwtPayload) {
    return this.analyticsService.getFunnel(user);
  }

  @Get('agents')
  getAgentPerformance(@CurrentUser() user: JwtPayload) {
    return this.analyticsService.getAgentPerformance(user);
  }

  @Get('sources')
  getSourceAnalytics(@CurrentUser() user: JwtPayload) {
    return this.analyticsService.getSourceAnalytics(user);
  }

  @Post('ask')
  askAI(@CurrentUser() user: JwtPayload, @Body('question') question: string) {
    return this.analyticsService.askAI(user, question);
  }
}
