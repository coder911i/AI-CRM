import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtPayload } from '@waterting/shared';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getFunnel(user: JwtPayload) {
    const stages = ['NEW_LEAD', 'CONTACTED', 'INTERESTED', 'VISIT_SCHEDULED', 'VISIT_DONE', 'NEGOTIATION', 'BOOKING_DONE', 'LOST'];
    const results = await this.prisma.lead.groupBy({
      by: ['stage'],
      where: { tenantId: user.tenantId },
      _count: { id: true },
    });

    return stages.map((stage) => ({
      stage,
      count: results.find((r) => r.stage === stage)?._count.id || 0,
    }));
  }

  async getAgentPerformance(user: JwtPayload) {
    const agents = await this.prisma.user.findMany({
      where: { tenantId: user.tenantId, role: { in: ['SALES_AGENT', 'SALES_MANAGER'] } },
      select: {
        id: true,
        name: true,
        _count: { select: { leads: true, siteVisits: true } },
      },
    });
    return agents;
  }

  async getSourceAnalytics(user: JwtPayload) {
    const results = await this.prisma.lead.groupBy({
      by: ['source'],
      where: { tenantId: user.tenantId },
      _count: { id: true },
    });
    return results.map((r) => ({ source: r.source, count: r._count.id }));
  }

  async askAI(user: JwtPayload, question: string) {
    // Placeholder for AI integration — would call OpenAI/Anthropic
    // For now, return a stub response
    return {
      question,
      answer: `AI analytics for "${question}" is not yet connected. This will be powered by OpenAI/Anthropic in production.`,
      timestamp: new Date().toISOString(),
    };
  }
}
