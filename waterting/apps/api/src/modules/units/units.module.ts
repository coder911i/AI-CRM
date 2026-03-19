import { Module } from '@nestjs/common';
import { UnitsController } from './units.controller';
import { UnitsService } from './units.service';
import { WorkersModule } from '../../workers/workers.module';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule, WorkersModule],
  controllers: [UnitsController],
  providers: [UnitsService]
})
export class UnitsModule {}
