import { Module } from '@nestjs/common';
import { BrokersController } from './brokers.controller';
import { BrokersService } from './brokers.service';
import { BrokerDisputesController } from './broker-disputes.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BrokersController, BrokerDisputesController],
  providers: [BrokersService],
  exports: [BrokersService]
})
export class BrokersModule {}
