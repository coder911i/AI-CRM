import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request, Res, Query, NotFoundException, Delete } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { JwtPayload, UserRole } from '@waterting/shared';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AIService } from '../../common/ai/ai.service';

import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('leads')
@ApiBearerAuth('JWT-auth')
@Controller('leads')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeadsController {
  constructor(
    private readonly leadsService: LeadsService,
    private prisma: PrismaService,
    private ai: AIService,
  ) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() createLeadDto: any) {
    return this.leadsService.create(user, createLeadDto);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.leadsService.findAll(user, Number(page || 1), Number(limit || 50));
  }

  @Get('assignment-stats')
  @Roles(UserRole.TENANT_ADMIN, UserRole.SALES_MANAGER)
  async getAssignmentStats(@CurrentUser() user: JwtPayload) {
    const agents = await this.prisma.user.findMany({
      where: {
        tenantId: user.tenantId,
        role: { in: ['SALES_AGENT', 'SALES_MANAGER'] },
        isActive: true,
      },
      select: { id: true, name: true }
    });

    const leadCounts = await this.prisma.lead.groupBy({
      by: ['assignedToId'],
      where: { 
        tenantId: user.tenantId,
        stage: { notIn: ['BOOKING_DONE', 'LOST'] }
      },
      _count: { id: true },
    });

    const stats = agents.map(a => {
      const count = leadCounts.find(c => c.assignedToId === a.id)?._count.id || 0;
      return { id: a.id, name: a.name, activeLeads: count };
    });

    return stats;
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.leadsService.findOne(user, id);
  }

  @Patch(':id')
  update(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() data: any) {
    return this.leadsService.update(user, id, data);
  }

  @Patch(':id/assign')
  assign(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body('userId') userId: string) {
    return this.leadsService.assign(user, id, userId);
  }

  @Post(':id/notes')
  addNote(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body('title') title: string, @Body('description') description: string) {
    return this.leadsService.addNote(user, id, title, description);
  }

  @Post(':id/calls')
  addCall(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body('duration') duration: string, @Body('outcome') outcome: string) {
    return this.leadsService.addCall(user, id, duration, outcome);
  }

  @Post('parse-whatsapp')
  @ApiOperation({ summary: 'Parse lead from WhatsApp text snippet using AI' })
  parseWhatsApp(@CurrentUser() user: JwtPayload, @Body('text') text: string) {
    return this.leadsService.parseWhatsAppLead(user, text);
  }

  @Patch(':id/stage')
  updateStage(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body('stage') stage: string) {
    return this.leadsService.updateStage(user, id, stage);
  }

  @Get(':id/ai-brief')
  async getAIBrief(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const lead = await this.prisma.lead.findUnique({
      where: { id, tenantId: user.tenantId },
      include: {
        activities: { take: 5, orderBy: { createdAt: 'desc' } },
        project: true,
      },
    });

    if (!lead) throw new NotFoundException('Lead not found');

    const prompt = `You are a real estate sales coach AI. The agent is about to call this lead RIGHT NOW.
Generate a sharp, actionable pre-call brief in under 60 seconds of reading time.

LEAD: ${lead.name} | Budget: ₹${lead.budgetMin ?? 0}L - ₹${lead.budgetMax ?? 0}L
SCORE: ${lead.score}/100 (${lead.scoreLabel}) | Stage: ${lead.stage}
PROJECT: ${lead.project?.name ?? 'Not specified'} | Source: ${lead.source}
TIMELINE: ${(lead as any).timeline ?? 'Not stated'}
LAST ${lead.activities.length} ACTIVITIES:
${lead.activities.map((a, i) => `${i + 1}. [${a.type}] ${a.title}: ${a.description ?? ''}`).join('\n')}

Return this exact JSON:
{
  "callObjective": "What should the agent try to achieve on THIS call (one sentence)",
  "contextSummary": "What happened last time and current situation (2 sentences max)",
  "likelyObjections": ["3 specific objections this lead might raise"],
  "responses": ["Suggested response to each objection above"],
  "recommendedUnit": "Specific unit type/floor/facing to pitch based on budget",
  "suggestedOpener": "Exact first sentence to say when they pick up",
  "redFlags": ["Any warning signs in this lead's behavior"],
  "urgencyScore": "1-10 how urgently agent should close this lead",
  "nextActionIfNoAnswer": "What to do if call goes to voicemail"
}`;

    return this.ai.generateJSON(prompt);
  }

  @Get(':id/whatsapp-message')
  async getWhatsAppMessage(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const lead = await this.prisma.lead.findUnique({
      where: { id, tenantId: user.tenantId },
      include: { project: true, assignedTo: true },
    });
    if (!lead) throw new NotFoundException('Lead not found');

    const agentName = lead.assignedTo?.name ?? 'your agent';
    const projectName = lead.project?.name ?? 'our property';
    const location = lead.project?.location ?? 'the site';
    const budget = lead.budgetMax ? `₹${lead.budgetMax}L` : 'the budget we discussed';
    const bhk = lead.preferredBHK ?? 'the model';

    const text = `Hi ${lead.name}, I'm ${agentName} from Waterting CRM.

As discussed, here's the property you were interested in:
📍 ${projectName}, ${location}
💰 Price: ${budget}
🏠 Type: ${bhk}

Would you like to schedule a site visit? Reply YES and I'll confirm a slot.`;

    return {
      phone: lead.phone,
      text,
      url: `https://wa.me/${lead.phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`,
    };
  }

  @Get(':id/ai-summary')
  async getAISummary(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const lead = await this.prisma.lead.findUnique({
      where: { id, tenantId: user.tenantId },
      include: {
        activities: { take: 10, orderBy: { createdAt: 'desc' } },
        project: true,
      },
    });

    if (!lead) throw new NotFoundException('Lead not found');

    const prompt = `Summarize this real estate lead's journey and intent in 3 concise bullet points.
    Name: ${lead.name}
    Current Stage: ${lead.stage}
    Budget: ₹${lead.budgetMin} - ₹${lead.budgetMax}
    Recent Actions: ${lead.activities.map(a => a.description).join('; ')}`;

    const summary = await this.ai.generateText(prompt);

    return { summary };
  }

  @Get('export/csv')
  async exportCSV(@Query() query: any, @Request() req: any, @Res() res: any) {
    const leads = await this.prisma.lead.findMany({
      where: { tenantId: req.user.tenantId },
      take: 10000,
      include: { project: true, assignedTo: true },
    });

    const header = 'Name,Phone,Email,Source,Stage,Score,Project,Assigned To,Created\n';
    const rows = leads
      .map(
        (l: any) =>
          `"${l.name}","${l.phone}","${l.email ?? ''}","${l.source}","${l.stage}","${l.score ?? ''}","${l.project?.name ?? ''}","${l.assignedTo?.name ?? ''}","${l.createdAt}"`,
      )
      .join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=leads.csv');
    res.send(header + rows);
  }

  @Delete(':id')
  @Roles(UserRole.TENANT_ADMIN)
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.leadsService.remove(user, id);
  }
}
