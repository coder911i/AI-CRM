import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtPayload } from '@waterting/shared';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { CommunicationService } from '../../common/comm/communication.service';

@Injectable()
export class AutomationsService {
  private readonly logger = new Logger(AutomationsService.name);

  constructor(
    private prisma: PrismaService,
    private comm: CommunicationService,
    @InjectQueue('email') private emailQueue: Queue,
    @InjectQueue('whatsapp') private whatsappQueue: Queue,
  ) {}

  async evaluateAutomations(tenantId: string, trigger: string, context: Record<string, any>) {
    const automations = await this.prisma.automation.findMany({
      where: { tenantId, trigger, isEnabled: true }
    });

    for (const automation of automations) {
      try {
        const conditions = (automation.conditions as any[]) || [];
        const actions = (automation.actions as any[]) || [];
        
        // Evaluate conditions
        const conditionsMet = conditions.every(cond => {
          const value = context[cond.field];
          if (cond.operator === 'equals') return String(value) === String(cond.value);
          if (cond.operator === 'greater_than') return Number(value) > Number(cond.value);
          if (cond.operator === 'contains') return String(value).toLowerCase().includes(String(cond.value).toLowerCase());
          return true;
        });

        if (!conditionsMet) continue;

        this.logger.log(`Executing automation ${automation.name} (${automation.id}) for trigger ${trigger}`);

        // Execute actions
        for (const action of actions) {
          if (action.type === 'SEND_EMAIL') {
            await this.emailQueue.add('send', { 
              to: context.email, 
              subject: action.subject, 
              html: action.body 
            });
          }
          if (action.type === 'SEND_WHATSAPP') {
            await this.comm.sendWhatsApp(context.phone, action.message);
          }
          if (action.type === 'UPDATE_STAGE') {
            await this.prisma.lead.update({ 
              where: { id: context.leadId }, 
              data: { stage: action.stage } 
            });
          }
          if (action.type === 'CREATE_ACTIVITY') {
            await this.prisma.activity.create({ 
              data: { 
                tenantId,
                leadId: context.leadId, 
                type: 'NOTE' as any, 
                title: 'Automated Action',
                description: action.note, 
                userId: context.agentId 
              } 
            });
          }
        }
      } catch (err) {
        this.logger.error(`Automation ${automation.id} failed:`, err);
      }
    }
  }

  async create(user: JwtPayload, data: any) {
    return this.prisma.automation.create({
      data: {
        ...data,
        tenantId: user.tenantId,
      },
    });
  }

  async findAll(user: JwtPayload) {
    return this.prisma.automation.findMany({
      where: { tenantId: user.tenantId },
    });
  }

  async toggle(user: JwtPayload, id: string) {
    const automation = await this.prisma.automation.findFirst({
      where: { id, tenantId: user.tenantId },
    });
    if (!automation) throw new NotFoundException('Automation not found');

    return this.prisma.automation.update({
      where: { id },
      data: { isEnabled: !automation.isEnabled },
    });
  }
}
