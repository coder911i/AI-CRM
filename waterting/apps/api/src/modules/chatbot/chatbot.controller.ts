import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('portal')
@ApiBearerAuth('JWT-auth')
@Controller('portal/chatbot')
@UseGuards(JwtAuthGuard)
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('message')
  handleMessage(@Request() req: any, @Body('message') message: string) {
    return this.chatbotService.handleMessage(req.user.email, req.user.sub, message);
  }
}
