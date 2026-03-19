import { Module, Global } from '@nestjs/common';
import { AIService } from './ai.service';
import { AiBriefingService } from './briefing.service';
import { PropertyRecService } from './property-rec.service';
import { PrismaModule } from '../prisma/prisma.module';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [AIService, AiBriefingService, PropertyRecService],
  exports: [AIService, AiBriefingService, PropertyRecService],
})
export class AIModule {}
