import { Injectable } from '@nestjs/common';
import { AIService } from '../../common/ai/ai.service';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ChatbotService {
  constructor(
    private ai: AIService,
    private prisma: PrismaService,
  ) {}

  async handleMessage(email: string, leadId: string, message: string) {
    // 1. Get context (user bookings, etc.)
    const bookings = await this.prisma.booking.findMany({
      where: { buyerEmail: email },
      include: { unit: { include: { tower: { include: { project: true } } } } }
    });

    const context = bookings.length > 0 
      ? `You are Waterting AI, an assistant for real estate buyers. The current user is ${email}. 
         They have ${bookings.length} booking(s). 
         Current Bookings: ${bookings.map(b => `${b.unit.tower.project.name} Unit ${b.unit.unitNumber} (Status: ${b.status})`).join(', ')}.`
      : `You are Waterting AI, an assistant for real estate buyers. The current user is ${email}. They have no active bookings yet. Speak helpfully about available projects.`;

    const systemPrompt = `${context}
    You can help with:
    - Checking booking status
    - Explaining payment schedules
    - Recommending projects
    - Scheduling site visits
    
    Be professional, concise, and helpful. If you don't know something, offer to connect them to a human agent.`;

    const response = await this.ai.generateText(`${systemPrompt}\n\nUser: ${message}`);
    return { response };
  }
}
