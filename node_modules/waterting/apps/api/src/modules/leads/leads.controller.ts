import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request, Res, Query, NotFoundException } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { JwtPayload, UserRole } from '@waterting/shared';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AIService } from '../../common/ai/ai.service';

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

  @Patch(':id/stage')
  updateStage(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body('stage') stage: string) {
    return this.leadsService.updateStage(user, id, stage);
  }

  @Patch(':id/unsubscribe')
  async unsubscribe(@Param('id') id: string, @Request() req: any) {
    await this.prisma.lead.update({
      where: { id, tenantId: req.user.tenantId },
      data: { emailOptOut: true },
    });
    return { message: 'Unsubscribed' };
  }

  // GET /leads/unsubscribe/:leadId — public endpoint (no auth)
  @Get('unsubscribe/:leadId')
  async publicUnsubscribe(@Param('leadId') leadId: string, @Res() res: any) {
    await this.prisma.lead.update({
      where: { id: leadId },
      data: { emailOptOut: true },
    });
    res.send('<h2>You have been unsubscribed.</h2><p>You will no longer receive emails from us.</p>');
  }

  @Post('bulk')
  @Roles(UserRole.TENANT_ADMIN, UserRole.SALES_MANAGER)
  async bulkAction(@Body() dto: any, @Request() req: any) {
    const { action, leadIds, payload } = dto;
    switch (action) {
      case 'reassign':
        await this.prisma.lead.updateMany({
          where: { id: { in: leadIds }, tenantId: req.user.tenantId },
          data: { assignedToId: payload.assignedToId },
        });
        break;
      case 'stage':
        for (const id of leadIds) {
          await this.leadsService.updateStage(req.user, id, payload.stage);
        }
        break;
    }
    return { updated: leadIds.length };
  }

  @Get('export/csv')
  async exportCSV(@Query() query: any, @Request() req: any, @Res() res: any) {
    // Basic export (limit 10000)
    const leads = await this.prisma.lead.findMany({
      where: { tenantId: req.user.tenantId },
      take: 10000,
      include: {
        project: true,
        assignedTo: true,
      }
    });

    const header = 'Name,Phone,Email,Source,Stage,Score,Project,Assigned To,Created\n';
    const rows = leads.map((l: any) =>
      `"${l.name}","${l.phone}","${l.email ?? ''}","${l.source}","${l.stage}","${l.score ?? ''}","${l.project?.name ?? ''}","${l.assignedTo?.name ?? ''}","${l.createdAt}"`
    ).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=leads.csv');
    res.send(header + rows);
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

    const prompt = `
Generate a 5-point pre-call sales brief for this real estate lead.
Lead: ${lead.name}, Budget: ₹${lead.budgetMax ?? 'unknown'}
AI Score: ${lead.score ?? 'not scored'}/100 (${lead.scoreLabel ?? 'unknown'})
Project: ${lead.project?.name ?? 'unknown'}
Recent activity: ${lead.activities.map(a => a.description).join('; ') || 'none'}

Return ONLY valid JSON:
{
  "background": "1 sentence",
  "scoreExplanation": "why this score",
  "likelyObjections": ["objection 1", "objection 2"],
  "recommendedUnit": "best unit based on budget",
  "suggestedOpener": "exact opening line for the call"
}`;

    return this.ai.generateJSON(prompt);
  }

  @Get(':id/recommendations')
  async getRecommendations(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const lead = await this.prisma.lead.findUnique({ where: { id, tenantId: user.tenantId } });
    if (!lead) throw new NotFoundException('Lead not found');

    // Vector search stub - returning top 3 units by budget/bhk match for now
    // In production this would use pgvector
    return this.prisma.unit.findMany({
      where: { 
        status: 'AVAILABLE',
        tower: { project: { tenantId: user.tenantId } },
        type: lead.preferredBHK ? (lead.preferredBHK as any) : undefined,
        totalPrice: { lte: lead.budgetMax || 100000000 }
      },
      take: 3,
      orderBy: { totalPrice: 'desc' }
    });
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
}
