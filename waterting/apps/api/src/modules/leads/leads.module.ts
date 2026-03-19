import { Module } from '@nestjs/common';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { BullModule } from '@nestjs/bull';
import { WorkersModule } from '../../workers/workers.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue(
      { name: 'ai-scoring' },
      { name: 'email' },
      { name: 'pdf' },
    ),
    WorkersModule,
    NotificationsModule,
  ],
  controllers: [LeadsController],
  providers: [LeadsService],
  exports: [LeadsService]
})
export class LeadsModule {}
