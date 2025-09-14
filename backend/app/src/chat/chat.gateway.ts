import {
  WebSocketGateway,
  SubscribeMessage,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ChatService } from './chat.service';
import {
  REDIS_EVENTS,
  WEBSOCKET_CHANEL_SEND,
  WEBSOCKET_CHANEL_LISTEN,
  WEBSOCKET_ROOM,
  COMMON_CHAT_ID,
} from './config';

import { AsyncApiPub, AsyncApiSub } from 'nestjs-asyncapi';

import { JwtService } from '@nestjs/jwt';
import type { JwtSocket } from 'src/types/socket-user';

import { authMiddleware } from '../auth/websocketsMiddlewares/auth.middleware';
import { PubSubService } from 'src/pub-sub/pub-sub.service';
import { UsersSockets } from 'src/utils/UsersSockets';
import { validateDto } from 'src/utils/validateDto';
import {
  getStatusErrorResponse,
  getStatusOkResponse,
} from 'src/utils/generateResponeWithStatus';

import {
  ChatMessageRes,
  ChatMessageResDto,
  DeleteChatMessageReqData,
  DeleteChatMessageReqDto,
  DeleteAllChatMessagesReqData,
  DeleteAllChatMessagesReqDto,
  CreateChatMessageReqDto,
} from './dto';
import { UsersService } from 'src/user/user.service';
import { DeleteChatMessageResDto } from './dto/ReqRes/delete-chat-message-res.dto';
import { DeleteAllChatMessagesResDto } from './dto/ReqRes/delete-all-chat-messages-res.dto';

@WebSocketGateway({
  path: '/chat/socket.io',
  namespace: 'api',
  rejectUnauthorized: false,
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server!: Server;

  private usersSockets: UsersSockets = new UsersSockets();

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly pubSubService: PubSubService,
    private readonly chatService: ChatService,
  ) { }

  async afterInit() {
    // Middleware проверки токена на handshake, предотвращающая подключение без валидного токена
    this.server.use(authMiddleware(this.jwtService, this.usersService));

    // Подписка на Pub/Sub для синхронизации событий между инстансами
    const subscribeChannels = [
      REDIS_EVENTS.SEND_MESSAGE,
      REDIS_EVENTS.DELETE_MESSAGE,
      REDIS_EVENTS.DELETE_ALL_MESSAGES,
    ] as const;

    type SubscribeChannel = (typeof subscribeChannels)[number];

    await this.pubSubService.subscribe(
      subscribeChannels as unknown as Array<SubscribeChannel>,
      async (channel: SubscribeChannel, message) => {
        try {
          const parsedMessage = JSON.parse(message);
          switch (channel) {
            case REDIS_EVENTS.SEND_MESSAGE: {
              try {
                const msg = await validateDto(
                  ChatMessageResDto,
                  parsedMessage as ChatMessageRes,
                );

                const roomKey = WEBSOCKET_ROOM.getChatRoomKey(msg.channelId);
                this.server
                  .to(roomKey)
                  .emit(WEBSOCKET_CHANEL_SEND.SENDED_MESSAGE, msg);
              } catch (error) {
                console.error(error.message);
              }
              break;
            }
            case REDIS_EVENTS.DELETE_MESSAGE: {
              try {
                const msg = await validateDto(
                  DeleteChatMessageReqDto,
                  parsedMessage as DeleteChatMessageReqData,
                );
                this.server.emit(WEBSOCKET_CHANEL_SEND.DELETED_MESSAGE, msg);
              } catch (error) {
                console.error(error.message);
              }
              break;
            }

            case REDIS_EVENTS.DELETE_ALL_MESSAGES: {
              try {
                const msg = await validateDto(
                  DeleteAllChatMessagesReqDto,
                  parsedMessage as DeleteAllChatMessagesReqData,
                );
                this.server.emit(WEBSOCKET_CHANEL_SEND.DELETED_MESSAGE, msg);
              } catch (error) {
                console.error(error.message);
              }
              break;
            }

            default:
            // ignore
          }
        } catch (err) {
          console.error('Error parsing Redis message:', err);
        }
      },
    );
  }

  async handleConnection(client: JwtSocket) {
    const userId = client.user.id;
    if (!userId || typeof userId !== 'string') {
      client.disconnect(true);
      return;
    }
    this.usersSockets.registerUserSocket(userId, client);
    const userSockets = this.usersSockets.getUserSockets(userId);
    const roomKey = WEBSOCKET_ROOM.getChatRoomKey(COMMON_CHAT_ID);
    const joinPromises: Array<void | Promise<void>> = [];

    for (const socket of userSockets) {
      joinPromises.push(socket.join(roomKey));
    }
    await Promise.all(joinPromises);
    console.log(`Client connected: ${client.id} ${userId}`);
  }

  handleDisconnect(client: JwtSocket) {
    const playerId = client.user?.id;
    if (playerId && typeof playerId === 'string') {
      this.usersSockets.unregisterUserSocket(playerId, client);
      console.log(`Client disconnected: ${client.id} ${playerId}`);
    }
  }

  @AsyncApiSub({
    channel: WEBSOCKET_CHANEL_LISTEN.SEND_MESSAGE,
    message: { payload: CreateChatMessageReqDto },
    summary: 'Client notifies that user send message',
  })
  @AsyncApiPub({
    channel: WEBSOCKET_CHANEL_SEND.SENDED_MESSAGE,
    message: { payload: ChatMessageResDto },
    summary: 'Response when user send message',
  })
  @SubscribeMessage(WEBSOCKET_CHANEL_LISTEN.SEND_MESSAGE)
  async handleSendMessage(
    @ConnectedSocket() client: JwtSocket,
    @MessageBody() dto: CreateChatMessageReqDto,
  ) {
    try {
      await this.chatService.sendMessage(client.user, dto);
      return getStatusOkResponse();
    } catch (err) {
      return getStatusErrorResponse(err.message);
    }
  }

  @AsyncApiSub({
    channel: WEBSOCKET_CHANEL_LISTEN.DELETE_MESSAGE,
    message: { payload: DeleteChatMessageReqDto },
    summary: 'Client notifies that message deleted',
  })
  @AsyncApiPub({
    channel: WEBSOCKET_CHANEL_SEND.DELETED_MESSAGE,
    message: { payload: DeleteChatMessageResDto },
    summary: 'Response when message deleted',
  })
  @SubscribeMessage(WEBSOCKET_CHANEL_LISTEN.DELETE_MESSAGE)
  async handleDeleteMessage(
    @ConnectedSocket() client: JwtSocket,
    @MessageBody() dto: DeleteChatMessageReqDto,
  ) {
    try {
      await this.chatService.removeMessage(client.user, dto);
      return getStatusOkResponse();
    } catch (err) {
      return getStatusErrorResponse(err.message);
    }
  }

  @AsyncApiSub({
    channel: WEBSOCKET_CHANEL_LISTEN.DELETE_ALL_MESSAGES,
    message: { payload: DeleteAllChatMessagesReqDto },
    summary: 'Client notifies that all messages in channel deleted',
  })
  @AsyncApiPub({
    channel: WEBSOCKET_CHANEL_SEND.DELETED_ALL_MESSAGES,
    message: { payload: DeleteAllChatMessagesResDto },
    summary: 'Response when all messages in channel  deleted',
  })
  @SubscribeMessage(WEBSOCKET_CHANEL_LISTEN.DELETE_ALL_MESSAGES)
  async handleDeleteAllMessages(
    @ConnectedSocket() client: JwtSocket,
    @MessageBody() dto: DeleteAllChatMessagesReqDto,
  ) {
    try {
      await this.chatService.removeAllMessages(client.user, dto);
      return getStatusOkResponse();
    } catch (err) {
      return getStatusErrorResponse(err.message);
    }
  }
}
