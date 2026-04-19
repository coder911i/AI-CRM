import { Module } from '@nestjs/common';
import { UnitsController } from './units.controller';
import { UnitsService } from './units.service';
import { WorkersModule } from '../../workers/workers.module';
import { GatewaysModule } from '../../gateways/gateways.module';

@Module({
  imports: [PrismaModule, WorkersModule, GatewaysModule],
  controllers: [UnitsController],
  providers: [UnitsService]
})
export class UnitsModule {}
