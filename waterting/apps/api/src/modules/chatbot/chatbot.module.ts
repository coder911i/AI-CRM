import { Module } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { ChatbotController } from './chatbot.controller';
import { AIModule } from '../../common/ai/ai.module';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [AIModule, PrismaModule],
  controllers: [ChatbotController],
  providers: [ChatbotService],
  exports: [ChatbotService],
})
export class ChatbotModule {}
