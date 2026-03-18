import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AIService } from './ai.service';

@Injectable()
export class AiBriefingService {
  private readonly logger = new Logger(AiBriefingService.name);

  constructor(
    private prisma: PrismaService,
    private ai: AIService,
  ) {}

  async getBriefing(leadId: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      include: { 
        activities: { take: 10, orderBy: { createdAt: 'desc' } },
        siteVisits: true,
        project: true
      },
    });

    if (!lead) throw new Error('Lead not found');

    const activitySummary = lead.activities.map(a => `- ${a.title}: ${a.description || ''}`).join('\n');
    const visitSummary = lead.siteVisits.map(v => `- Visit on ${v.scheduledAt}: ${v.outcome || 'No outcome'}`).join('\n');

    const prompt = `
Analyze this real estate lead history and generate a pre-call briefing for the sales agent.

Lead Name: ${lead.name}
Project: ${lead.project?.name || 'Unknown'}
Budget: ${lead.budgetMax || 'Unknown'}
Timeline: ${lead.timeline || 'Unknown'}

Recent Activities:
${activitySummary}

Site Visits:
${visitSummary}

Return valid JSON:
{
  "summary": "1-sentence context",
  "talkingPoints": ["point 1", "point 2", "point 3"],
  "predictedObjection": "the most likely hurdle",
  "recommendedAction": "e.g. invite for site visit"
}
`;

    return this.ai.generateJSON(prompt);
  }
}
