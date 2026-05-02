import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { AutomationsModule } from '../automations/automations.module';
import { BullModule } from '@nestjs/bull';
import { AuditModule } from '../../common/audit/audit.module';

@Module({
  imports: [
    PrismaModule, 
    AutomationsModule,
    AuditModule,
    BullModule.registerQueue({ name: 'pdf' }),
  ],
  controllers: [BookingsController],
  providers: [BookingsService]
})
export class BookingsModule {}
