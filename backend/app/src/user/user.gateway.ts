import {
  WebSocketGateway,
  SubscribeMessage,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { UsersService } from './user.service';
import {
  REDIS_EVENTS,
  WEBSOCKET_CHANEL_SEND,
  WEBSOCKET_CHANEL_LISTEN,
} from './config';

import { AsyncApiPub, AsyncApiSub } from 'nestjs-asyncapi';

import { JwtService } from '@nestjs/jwt';
import type { JwtSocket } from 'src/types/socket-user';

import { authMiddleware } from '../auth/websocketsMiddlewares/auth.middleware';
import { PubSubService } from 'src/pub-sub/pub-sub.service';
import { UsersSockets } from 'src/utils/UsersSockets';
import {
  OnlineUserChangedPubSubEventData,
  OnlineUserChangedPubSubEventDto,
  OnlineUserInfo,
  OnlineUserInfoDto,
} from './dto';
import { validateDto } from 'src/utils/validateDto';
import {
  getStatusErrorResponse,
  getStatusOkResponse,
} from 'src/utils/generateResponeWithStatus';

@WebSocketGateway({
  path: '/user/socket.io',
  namespace: 'api',
  rejectUnauthorized: false,
})
export class UserGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server!: Server;

  private usersSockets: UsersSockets = new UsersSockets();

  constructor(
    private readonly pubSubService: PubSubService,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  async afterInit() {
    // Middleware проверки токена на handshake, предотвращающая подключение без валидного токена
    this.server.use(authMiddleware(this.jwtService, this.usersService));

    // Подписка на Pub/Sub для синхронизации событий между инстансами
    const subscribeChannels = [REDIS_EVENTS.ONLINE_USERS_CHANGED] as const;

    type SubscribeChannel = (typeof subscribeChannels)[number];

    await this.pubSubService.subscribe(
      subscribeChannels as unknown as Array<SubscribeChannel>,
      async (channel: SubscribeChannel, message) => {
        try {
          const parsedMessage = JSON.parse(message);
          switch (channel) {
            case REDIS_EVENTS.ONLINE_USERS_CHANGED: {
              try {
                const userStatusesPromises = (
                  parsedMessage as OnlineUserChangedPubSubEventData[]
                ).map(async (userStatus) => {
                  const userStatusValidated = await validateDto(
                    OnlineUserChangedPubSubEventDto,
                    userStatus,
                  );

                  const user = (await this.usersService.findById(
                    userStatusValidated.playerId,
                  ))!;

                  const userInfo: OnlineUserInfo = {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    roles: user.roles,
                    avatarUrl: user.avatarUrl,
                    isOnline: userStatusValidated.isOnline,
                  };

                  const userInfoValidated = await validateDto(
                    OnlineUserInfoDto,
                    userInfo,
                  );

                  return userInfoValidated;
                });
                const userStatuses = await Promise.all(userStatusesPromises);
                this.server.emit(
                  WEBSOCKET_CHANEL_SEND.ONLINE_USERS_CHANGED,
                  userStatuses,
                );
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

  handleConnection(client: JwtSocket) {
    const userId = client.user.id;
    if (!userId || typeof userId !== 'string') {
      client.disconnect(true);
      return;
    }
    this.usersSockets.registerUserSocket(userId, client);
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
    channel: WEBSOCKET_CHANEL_LISTEN.ONLINE_USER,
    message: { payload: Object },
    summary: 'Client notifies that user is online',
  })
  @AsyncApiPub({
    channel: WEBSOCKET_CHANEL_SEND.ONLINE_USERS_CHANGED,
    message: { payload: OnlineUserChangedPubSubEventDto },
    summary: 'Response when user change online status',
  })
  @SubscribeMessage(WEBSOCKET_CHANEL_LISTEN.ONLINE_USER)
  async handleIMOnline(@ConnectedSocket() client: JwtSocket) {
    try {
      await this.usersService.IMOnline(client.user.id);
      return getStatusOkResponse();
    } catch (err) {
      return getStatusErrorResponse(err.message);
    }
  }
}
