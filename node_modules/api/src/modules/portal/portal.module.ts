import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PortalService } from './portal.service';
import { PortalController } from './portal.controller';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret-minimum-32-character-strong-secret-here',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [PortalController],
  providers: [PortalService],
})
export class PortalModule {}
