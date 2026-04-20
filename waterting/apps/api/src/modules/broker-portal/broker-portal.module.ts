import { Module } from '@nestjs/common';
import { BrokerPortalService } from './broker-portal.service';
import { BrokerPortalController } from './broker-portal.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BrokerPortalController],
  providers: [BrokerPortalService],
})
export class BrokerPortalModule {}
