import { Module } from '@nestjs/common';
import { SiteVisitsController } from './site-visits.controller';
import { SiteVisitsService } from './site-visits.service';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { CommunicationModule } from '../../common/comm/communication.module';

@Module({
  imports: [PrismaModule, CommunicationModule],
  controllers: [SiteVisitsController],
  providers: [SiteVisitsService]
})
export class SiteVisitsModule {}
