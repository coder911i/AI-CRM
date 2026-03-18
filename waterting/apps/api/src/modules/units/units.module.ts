import { Module } from '@nestjs/common';
import { UnitsController } from './units.controller';
import { UnitsService } from './units.service';
import { WorkersModule } from '../../workers/workers.module';

@Module({
  imports: [WorkersModule],
  controllers: [UnitsController],
  providers: [UnitsService]
})
export class UnitsModule {}
