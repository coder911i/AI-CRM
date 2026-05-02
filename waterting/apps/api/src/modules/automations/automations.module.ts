import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { AutomationsController } from './automations.controller';
import { AutomationsService } from './automations.service';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { CommunicationModule } from '../../common/comm/communication.module';

@Global()
@Module({
  imports: [
    PrismaModule,
    CommunicationModule,
    BullModule.registerQueue(
      { name: 'email' },
      { name: 'whatsapp' },
    ),
  ],
  controllers: [AutomationsController],
  providers: [AutomationsService],
  exports: [AutomationsService]
})
export class AutomationsModule {}
