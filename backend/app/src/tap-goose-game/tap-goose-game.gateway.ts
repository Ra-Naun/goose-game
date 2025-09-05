import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { TapGooseGameService } from './tap-goose-game.service';
import {
  REDIS_EVENTS,
  WEBSOCKET_CHANEL_SEND,
  WEBSOCKET_CHANEL_LISTEN,
  WEBSOCKET_ROOM,
} from './config';

import { AsyncApiPub, AsyncApiSub } from 'nestjs-asyncapi';
import {
  GameMatchDto,
  CreateMatchDto,
  TapErrorDto,
  TapGooseDto,
  TapSuccessDto,
  UpdateGooseGameMatchPubSubEventDto,
  UserGooseTapPubSubEventDto,
  UserJoinedOrLeftMatchPubSubEventDto,
  UserJoinOrLeftMatchDto,
  UserOnlineChangedPubSubEventDto,
  UserInfoDto,
} from './dto';
import { TapGooseGamePubSubService } from './pub-sub.service';
import { UseGuards } from '@nestjs/common';
import { UsersService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRoleEnum } from 'src/user/dto/types';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import type { JwtSocket } from 'src/types/socket-user';
import {
  getStatusErrorResponse,
  getStatusOkResponse,
  validateDto,
} from './utils';
import { authMiddleware } from '../auth/websocketsMiddlewares/auth.middleware';

class UsersSockets {
  usersSockets: Map<string, Set<Socket>> = new Map(); // playerId -> Set<Socket>

  getUserSockets(playerId: string): Set<Socket> {
    if (!this.usersSockets.has(playerId)) {
      this.usersSockets.set(playerId, new Set());
    }
    return this.usersSockets.get(playerId)!;
  }

  registerUserSocket(playerId: string, socket: Socket) {
    const userSockets = this.getUserSockets(playerId);
    userSockets.add(socket);
  }

  unregisterUserSocket(playerId: string, socket: Socket) {
    const userSockets = this.getUserSockets(playerId);
    userSockets.delete(socket);
    if (userSockets.size === 0) {
      this.usersSockets.delete(playerId);
    }
  }
}

@WebSocketGateway({
  path: '/tap-goose-game/socket.io',
  namespace: 'api',
  rejectUnauthorized: false,
})
export class TapGooseGameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server!: Server;

  private usersSockets: UsersSockets = new UsersSockets();

  constructor(
    private readonly gameService: TapGooseGameService,
    private readonly pubSubService: TapGooseGamePubSubService,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  async afterInit() {
    // Middleware проверки токена на handshake, предотвращающая подключение без валидного токена
    this.server.use(authMiddleware(this.jwtService, this.usersService));

    // Подписка на Pub/Sub для синхронизации событий между инстансами
    const subscribeChannels = [
      REDIS_EVENTS.GOOSE_MATCH_STATE,
      REDIS_EVENTS.GOOSE_MATCH_TAP,
      REDIS_EVENTS.GOOSE_MATCH_CREATED,
      REDIS_EVENTS.GOOSE_MATCH_USER_JOINED,
      REDIS_EVENTS.GOOSE_MATCH_USER_LEFT,
      REDIS_EVENTS.ONLINE_USERS_CHANGED,
    ] as const;

    type SubscribeChannel = (typeof subscribeChannels)[number];

    await this.pubSubService.subscribe(
      subscribeChannels as unknown as Array<SubscribeChannel>,
      async (channel: SubscribeChannel, message) => {
        try {
          const parsedMessage = JSON.parse(message);
          switch (channel) {
            case REDIS_EVENTS.GOOSE_MATCH_STATE: {
              try {
                const msg = await validateDto(
                  UpdateGooseGameMatchPubSubEventDto,
                  parsedMessage,
                );
                this.server.emit(WEBSOCKET_CHANEL_SEND.MATCH_STATE_UPDATE, msg);
              } catch (error) {
                console.error(error.message);
              }
              break;
            }
            case REDIS_EVENTS.GOOSE_MATCH_TAP: {
              try {
                const msg = await validateDto(
                  UserGooseTapPubSubEventDto,
                  parsedMessage,
                );
                const { matchId } = msg;
                const roomKey = WEBSOCKET_ROOM.getMatchRoomKey(matchId);
                // Отправляем только в комнату матча
                this.server
                  .to(roomKey)
                  .emit(WEBSOCKET_CHANEL_SEND.GOOSE_TAP_SUCCESS, msg);
              } catch (error) {
                console.error(error.message);
              }
              break;
            }
            case REDIS_EVENTS.GOOSE_MATCH_CREATED: {
              try {
                const msg = await validateDto(GameMatchDto, parsedMessage);
                this.server.emit(WEBSOCKET_CHANEL_SEND.MATCH_CREATED, msg);
              } catch (error) {
                console.error(error.message);
              }
              break;
            }
            case REDIS_EVENTS.GOOSE_MATCH_USER_JOINED: {
              try {
                const msg = await validateDto(
                  UserJoinedOrLeftMatchPubSubEventDto,
                  parsedMessage,
                );

                const { playerId, matchId } = msg;
                const userSockets = this.usersSockets.getUserSockets(playerId);
                const roomKey = WEBSOCKET_ROOM.getMatchRoomKey(matchId);
                for (const socket of userSockets) {
                  await socket.join(roomKey);
                }
                this.server.emit(
                  WEBSOCKET_CHANEL_SEND.MATCH_USER_JOIN_SUCCESS,
                  msg,
                );
              } catch (error) {
                console.error(error.message);
              }
              break;
            }

            case REDIS_EVENTS.GOOSE_MATCH_USER_LEFT: {
              try {
                const msg = await validateDto(
                  UserJoinedOrLeftMatchPubSubEventDto,
                  parsedMessage,
                );

                const { playerId, matchId } = msg;
                const userSockets = this.usersSockets.getUserSockets(playerId);
                const roomKey = WEBSOCKET_ROOM.getMatchRoomKey(matchId);
                for (const socket of userSockets) {
                  await socket.leave(roomKey);
                }
                this.server.emit(
                  WEBSOCKET_CHANEL_SEND.MATCH_USER_LEFT_SUCCESS,
                  msg,
                );
              } catch (error) {
                console.error(error.message);
              }
              break;
            }

            case REDIS_EVENTS.ONLINE_USERS_CHANGED: {
              try {
                const userStatusesPromises = (
                  parsedMessage as UserOnlineChangedPubSubEventDto[]
                ).map(async (userStatus) => {
                  const userStatusValidated = await validateDto(
                    UserOnlineChangedPubSubEventDto,
                    userStatus,
                  );

                  const user = (await this.usersService.findById(
                    userStatusValidated.playerId,
                  ))!;

                  const userInfo: UserInfoDto = {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    roles: user.roles,
                    isOnline: userStatusValidated.isOnline,
                  };

                  const userInfoValidated = await validateDto(
                    UserInfoDto,
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
    const playerId = client.user.id;
    if (!playerId || typeof playerId !== 'string') {
      client.disconnect(true);
      return;
    }
    this.usersSockets.registerUserSocket(playerId, client);
    console.log(`Client connected: ${client.id} ${playerId}`);
  }

  handleDisconnect(client: JwtSocket) {
    const playerId = client.user?.id;
    if (playerId && typeof playerId === 'string') {
      this.usersSockets.unregisterUserSocket(playerId, client);
      console.log(`Client disconnected: ${client.id} ${playerId}`);
    }
  }

  @AsyncApiSub({
    channel: WEBSOCKET_CHANEL_LISTEN.CREATE_MATCH,
    message: { payload: CreateMatchDto },
    summary: 'Client requests to create a new match',
  })
  @AsyncApiPub({
    channel: WEBSOCKET_CHANEL_SEND.MATCH_CREATED,
    message: { payload: GameMatchDto },
    summary: 'Response when a match is created',
  })
  @Roles(UserRoleEnum.ADMIN)
  @UseGuards(RolesGuard)
  @SubscribeMessage(WEBSOCKET_CHANEL_LISTEN.CREATE_MATCH)
  async handleCreateMatch(
    @MessageBody() dto: CreateMatchDto,
    @ConnectedSocket() client: JwtSocket,
  ) {
    try {
      const matchId = await this.gameService.createMatch(client.user.id, dto);
      return getStatusOkResponse({
        matchId,
      });
    } catch (err) {
      return getStatusOkResponse(err.message);
    }
  }

  @SubscribeMessage(WEBSOCKET_CHANEL_LISTEN.MATCH_USER_JOIN)
  async handleUserJoinToMatch(
    @MessageBody() dto: UserJoinOrLeftMatchDto,
    @ConnectedSocket() client: JwtSocket,
  ) {
    try {
      await this.gameService.addPlayerToMatch(dto.matchId, client.user.id);
      return getStatusOkResponse();
    } catch (err) {
      return getStatusErrorResponse(err.message);
    }
  }

  @SubscribeMessage(WEBSOCKET_CHANEL_LISTEN.MATCH_USER_LEFT)
  async handleUserLeftFromMatch(
    @MessageBody() dto: UserJoinOrLeftMatchDto,
    @ConnectedSocket() client: JwtSocket,
  ) {
    try {
      await this.gameService.removePlayerFromMatch(dto.matchId, client.user.id);
      return getStatusOkResponse();
    } catch (err) {
      return getStatusErrorResponse(err.message);
    }
  }

  @AsyncApiSub({
    channel: WEBSOCKET_CHANEL_LISTEN.GOOSE_TAP,
    message: { payload: TapGooseDto },
    summary: 'Client sends a tap event on goose',
  })
  @AsyncApiPub({
    channel: WEBSOCKET_CHANEL_SEND.GOOSE_TAP_SUCCESS,
    message: { payload: TapSuccessDto },
    summary: 'Response when clicking on the goose successfully',
  })
  @AsyncApiPub({
    channel: WEBSOCKET_CHANEL_SEND.GOOSE_TAP_ERROR,
    message: { payload: TapErrorDto },
    summary: 'Response when clicking on a goose error',
  })
  @SubscribeMessage(WEBSOCKET_CHANEL_LISTEN.GOOSE_TAP)
  async handleTapGoose(
    @MessageBody() data: TapGooseDto,
    @ConnectedSocket() client: JwtSocket,
  ) {
    try {
      await this.gameService.tapGoose(
        data.matchId,
        client.user.id,
        data.tapCount,
      );
      return getStatusOkResponse();
    } catch (err) {
      return getStatusErrorResponse(err.message);
    }
  }

  @AsyncApiSub({
    channel: WEBSOCKET_CHANEL_LISTEN.GOOSE_TAP,
    message: { payload: TapGooseDto },
    summary: 'Client sends a tap event on goose',
  })
  @AsyncApiPub({
    channel: WEBSOCKET_CHANEL_SEND.GOOSE_TAP_SUCCESS,
    message: { payload: TapSuccessDto },
    summary: 'Response when clicking on the goose successfully',
  })
  @AsyncApiPub({
    channel: WEBSOCKET_CHANEL_SEND.GOOSE_TAP_ERROR,
    message: { payload: TapErrorDto },
    summary: 'Response when clicking on a goose error',
  })
  @SubscribeMessage(WEBSOCKET_CHANEL_LISTEN.ONLINE_USER)
  async handleIMOnline(@ConnectedSocket() client: JwtSocket) {
    try {
      await this.gameService.IMOnline(client.user.id);
      return getStatusOkResponse();
    } catch (err) {
      client.emit(WEBSOCKET_CHANEL_SEND.ONLINE_USER_ERROR, {
        message: err.message,
      });
      return getStatusErrorResponse(err.message);
    }
  }
}
