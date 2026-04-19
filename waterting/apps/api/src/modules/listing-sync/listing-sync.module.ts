import { Module } from '@nestjs/common';
import { ListingSyncService } from './listing-sync.service';
import { ListingSyncController } from './listing-sync.controller';

@Module({
  controllers: [ListingSyncController],
  providers: [ListingSyncService],
  exports: [ListingSyncService],
})
export class ListingSyncModule {}
