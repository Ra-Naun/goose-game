import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { PubSubService } from 'src/pub-sub/pub-sub.service';
import { ChatGateway } from './chat.gateway';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/user/user.service';
import { ExternalCacheService } from 'src/external-cache/external-cache.service';

@Module({
  controllers: [ChatController],
  providers: [
    ExternalCacheService,
    UsersService,
    PubSubService,
    PrismaService,
    ChatGateway,
    ChatService,
  ],
  exports: [ChatService],
})
export class ChatModule { }
