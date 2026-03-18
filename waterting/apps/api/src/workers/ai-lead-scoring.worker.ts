import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { EventsGateway } from '../gateways/events.gateway';
import OpenAI from 'openai';

@Processor('ai-scoring')
@Injectable()
export class AiLeadScoringWorker {
  private openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  constructor(
    private prisma: PrismaService,
    private events: EventsGateway,
  ) {}

  @Process('score-lead')
  async scoreLead(job: Job<{ leadId: string; tenantId: string }>) {
    const { leadId, tenantId } = job.data;

    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      include: { project: true },
    });
    if (!lead) return;

    // Get historical conversion rate for this source
    const totalBySource = await this.prisma.lead.count({
      where: { tenantId, source: lead.source },
    });
    const bookedBySource = await this.prisma.lead.count({
      where: { tenantId, source: lead.source, stage: 'BOOKING_DONE' },
    });
    const conversionRate = totalBySource > 0
      ? Math.round((bookedBySource / totalBySource) * 100)
      : 10;

    // Get project price range
    const units = await this.prisma.unit.findMany({
      where: { tower: { project: { id: lead.projectId ?? '' } } },
      select: { totalPrice: true },
    });
    const prices = units.map(u => u.totalPrice);
    const minPrice = prices.length ? Math.min(...prices) : 0;
    const maxPrice = prices.length ? Math.max(...prices) : 0;

    const prompt = `
Score this real estate lead 0-100 for purchase conversion probability.

Budget match (25%): Lead budget ₹${lead.budgetMax ?? 'unknown'}, project range ₹${minPrice}–₹${maxPrice}.
Source quality (20%): Historical conversion for ${lead.source} is ${conversionRate}%.
Timeline urgency (15%): Wants to buy in ${lead.timeline ?? 'unknown'}.
Response speed (15%): Lead was created ${Math.round((Date.now() - lead.createdAt.getTime()) / 3600000)} hours ago.
Behavioral signals (15%): Source is ${lead.source}.
Demographics (10%): No demographic data yet.

Return ONLY valid JSON with no extra text:
{"score": <0-100>, "label": "Cold|Warm|Hot|Very Hot", "reasoning": "<2 sentences max>"}
`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 200,
    });

    const result = JSON.parse(response.choices[0].message.content!);
    const score = Math.min(100, Math.max(0, result.score));
    const scoreLabel = result.label as string;

    await this.prisma.lead.update({
      where: { id: leadId },
      data: { score, scoreLabel: scoreLabel.replace(' ', '_').toUpperCase() as any },
    });

    // Log activity
    await this.prisma.activity.create({
      data: {
        leadId,
        type: 'AI_ACTION',
        title: `AI Score: ${score}/100 (${scoreLabel})`,
        description: result.reasoning,
      },
    });

    // Emit real-time update to frontend
    this.events.emitToTenant(tenantId, 'lead:scored', {
      leadId,
      score,
      scoreLabel,
    });
  }
}
