import { Module } from '@nestjs/common';
import { OwnerPortalService } from './owner-portal.service';
import { OwnerPortalController } from './owner-portal.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [OwnerPortalController],
  providers: [OwnerPortalService],
})
export class OwnerPortalModule {}
