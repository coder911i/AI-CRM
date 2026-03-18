import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtPayload } from '@waterting/shared';
import OpenAI from 'openai';

@Injectable()
export class AnalyticsService {
  private openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
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
    const leads = await this.getFunnel(user);
    const sourceData = await this.getSourceAnalytics(user);

    const prompt = `
Question: ${question}
Context Data: 
Funnel: ${JSON.stringify(leads)}
Sources: ${JSON.stringify(sourceData)}

As a CRM Analyst, provide a 2-sentence answer and a suggested chart type (Bar, Pie, or Line).
Return ONLY JSON: { "answer": "...", "chartType": "..." }`;

    const res = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const aiRes = JSON.parse(res.choices[0].message.content!);
    
    // Attach the relevant data based on chartType
    let chartData = [];
    if (aiRes.chartType?.toUpperCase() === 'BAR') chartData = leads;
    if (aiRes.chartType?.toUpperCase() === 'PIE') chartData = sourceData;
    if (aiRes.chartType?.toUpperCase() === 'LINE') chartData = leads; // Fallback to funnel trends

    return {
      ...aiRes,
      chartData,
      timestamp: new Date().toISOString(),
    };
  }
}
