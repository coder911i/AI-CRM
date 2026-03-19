import { Module } from '@nestjs/common';
import { BrokersController } from './brokers.controller';
import { BrokersService } from './brokers.service';
import { BrokerDisputesController } from './broker-disputes.controller';
import { BrokerDisputeService } from './dispute.service';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BrokersController, BrokerDisputesController],
  providers: [BrokersService, BrokerDisputeService],
  exports: [BrokersService]
})
export class BrokersModule {}
