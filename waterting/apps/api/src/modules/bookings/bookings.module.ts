import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { AutomationsModule } from '../automations/automations.module';

@Module({
  imports: [PrismaModule, AutomationsModule],
  controllers: [BookingsController],
  providers: [BookingsService]
})
export class BookingsModule {}
