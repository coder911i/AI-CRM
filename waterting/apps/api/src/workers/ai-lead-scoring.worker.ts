import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { EventsGateway } from '../gateways/events.gateway';
import { AIService } from '../common/ai/ai.service';
import * as Sentry from '@sentry/node';

@Processor('ai-scoring')
@Injectable()
export class AiLeadScoringWorker {
  private readonly logger = new Logger(AiLeadScoringWorker.name);

  constructor(
    private prisma: PrismaService,
    private events: EventsGateway,
    private ai: AIService,
  ) {}

  @Process('score-lead')
  async scoreLead(job: Job<{ leadId: string; tenantId: string }>) {
    const { leadId, tenantId } = job.data;
    try {
      this.logger.log(`Scoring lead: ${leadId}`);

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
  Score this real estate lead from 0 to 100 for purchase conversion probability based on these PRD weights:
  
  1. Budget match (25%): Lead budget up to ₹${lead.budgetMax ?? 'unknown'}, project price range ₹${minPrice}–₹${maxPrice}.
  2. Source quality (20%): Historical conversion for ${lead.source} is ${conversionRate}%.
  3. Response speed (15%): Lead was created ${Math.round((Date.now() - lead.createdAt.getTime()) / 3600000)} hours ago. (Lower is better)
  4. Timeline urgency (15%): Wants to buy in ${lead.timeline ?? 'unknown'}. (Immediate is best)
  5. Behavioral signals (15%): Source is ${lead.source}. (Organic/Portal is better than Mass Campaign)
  6. Demographics (10%): No specific data yet.
  
  PRD Score Labels:
  - Cold: 0-30
  - Warm: 31-60
  - Hot: 61-80
  - Very Hot: 81-100
  
  Return ONLY valid JSON:
  {"score": <number>, "label": "COLD|WARM|HOT|VERY_HOT", "reasoning": "string"}
  `;

      let result;
      try {
        result = await this.ai.generateJSON<{ score: number; label: string; reasoning: string }>(prompt);
      } catch (aiErr) {
        this.logger.error(`AI scoring generation failed for lead ${leadId}`, aiErr);
        Sentry.captureException(aiErr);
        // Fallback to basic scoring if AI fails
        result = { score: 10, label: 'COLD', reasoning: 'AI scoring failed, assigned default cold score.' };
      }

      const score = Math.min(100, Math.max(0, result.score));
      const scoreLabel = result.label.toUpperCase().replace(' ', '_');

      await this.prisma.lead.update({
        where: { id: leadId },
        data: { 
          score, 
          scoreLabel: scoreLabel as any 
        },
      });

      // Log activity
      await this.prisma.activity.create({
        data: {
          leadId,
          type: 'AI_ACTION' as any,
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
      this.logger.log(`Successfully scored lead ${leadId}: ${score}`);
    } catch (err) {
      this.logger.error(`Failed to score lead ${leadId}`, err);
      Sentry.captureException(err);
    }
  }
}
