import { Controller, Get, Request, UseGuards, Param } from '@nestjs/common';

import { ChatService } from './chat.service';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { TOKEN_KEY } from 'src/auth/config';
import type { JwtRequest } from 'src/types/request-user';
import { ChatMessageResDto } from './dto';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) { }

  @ApiBearerAuth(TOKEN_KEY)
  @UseGuards(JwtAuthGuard)
  @Get('history/:channelId')
  async getChatMessages(
    @Request() req: JwtRequest,
    @Param('channelId') channelId: string,
  ): Promise<Array<ChatMessageResDto>> {
    const data = await this.chatService.getChanelMessages(req.user, channelId);
    return data;
  }
}
