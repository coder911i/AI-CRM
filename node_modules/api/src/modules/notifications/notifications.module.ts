import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { GatewaysModule } from '../../gateways/gateways.module';

@Module({
  imports: [PrismaModule, GatewaysModule],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
