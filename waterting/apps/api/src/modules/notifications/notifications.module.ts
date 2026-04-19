import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { GatewaysModule } from '../../gateways/gateways.module';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    PrismaModule, 
    GatewaysModule,
    BullModule.registerQueue({ name: 'whatsapp' }),
    BullModule.registerQueue({ name: 'email' }),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
