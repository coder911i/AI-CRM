import { Module } from '@nestjs/common';
import { AgentPanelService } from './agent-panel.service';
import { AgentPanelController } from './agent-panel.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AgentPanelController],
  providers: [AgentPanelService],
})
export class AgentPanelModule {}
