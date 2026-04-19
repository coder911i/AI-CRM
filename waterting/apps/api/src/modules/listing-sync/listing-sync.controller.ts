import { Controller, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ListingSyncService } from './listing-sync.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { JwtPayload } from '@waterting/shared';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('listings')
@ApiBearerAuth('JWT-auth')
@Controller('listings/:id/sync')
@UseGuards(JwtAuthGuard)
export class ListingSyncController {
  constructor(private readonly listingSyncService: ListingSyncService) {}

  @Post()
  sync(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() data: { portals: string[] }) {
    return this.listingSyncService.syncListing(user, id, data.portals);
  }
}
