import { Module } from '@nestjs/common';
import { AllocationController } from './allocation.controller';
import { AllocationService } from './allocation.service';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { CommunicationModule } from '../../common/comm/communication.module';

@Module({
  imports: [PrismaModule, CommunicationModule],
  controllers: [AllocationController],
  providers: [AllocationService],
  exports: [AllocationService],
})
export class AllocationModule {}
