import { Global, Module } from '@nestjs/common';
import { SyncGateway } from './sync.gateway';

@Global()
@Module({
  providers: [SyncGateway],
  exports: [SyncGateway],
})
export class RealtimeModule {}
