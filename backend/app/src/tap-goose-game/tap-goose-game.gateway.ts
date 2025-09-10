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
import { Server } from 'socket.io';
import { TapGooseGameService } from './tap-goose-game.service';
import {
  REDIS_EVENTS,
  WEBSOCKET_CHANEL_SEND,
  WEBSOCKET_CHANEL_LISTEN,
  WEBSOCKET_ROOM,
} from './config';

import { AsyncApiPub, AsyncApiSub } from 'nestjs-asyncapi';
import {
  GooseGameMatchDto,
  CreateGooseMatchRequestDto,
  TapGooseRequestDto,
  UserGooseTapPubSubEventDto,
  UserJoinOrLeaveGooseMatchRequestDto,
  UserJoinedGooseMatchPubSubEventDto,
  UserLeaveGooseMatchPubSubEventDto,
  StartedGooseGameMatchPubSubEventDto,
  EndedGooseGameMatchPubSubEventDto,
} from './dto';
import { PubSubService } from '../pub-sub/pub-sub.service';
import { UseGuards } from '@nestjs/common';
import { UsersService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRoleEnum } from 'src/user/dto/types';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import type { JwtSocket } from 'src/types/socket-user';
import { UsersSockets } from 'src/utils/UsersSockets';

import { authMiddleware } from '../auth/websocketsMiddlewares/auth.middleware';
import {
  getStatusErrorResponse,
  getStatusOkResponse,
} from 'src/utils/generateResponeWithStatus';
import { validateDto } from 'src/utils/validateDto';
import { HelperService } from './helper.service';

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
    private readonly pubSubService: PubSubService,
    private usersService: UsersService,
    private jwtService: JwtService,
    private readonly helper: HelperService,
  ) { }

  async afterInit() {
    // Middleware проверки токена на handshake, предотвращающая подключение без валидного токена
    this.server.use(authMiddleware(this.jwtService, this.usersService));

    // Подписка на Pub/Sub для синхронизации событий между инстансами
    const subscribeChannels = [
      REDIS_EVENTS.GOOSE_MATCH_CREATED,
      REDIS_EVENTS.GOOSE_MATCH_STARTED,
      REDIS_EVENTS.GOOSE_MATCH_ENDED,
      REDIS_EVENTS.GOOSE_MATCH_TAP,
      REDIS_EVENTS.GOOSE_MATCH_USER_JOINED,
      REDIS_EVENTS.GOOSE_MATCH_USER_LEAVE,
    ] as const;

    type SubscribeChannel = (typeof subscribeChannels)[number];

    await this.pubSubService.subscribe(
      subscribeChannels as unknown as Array<SubscribeChannel>,
      async (channel: SubscribeChannel, message) => {
        try {
          const parsedMessage = JSON.parse(message);
          switch (channel) {
            case REDIS_EVENTS.GOOSE_MATCH_STARTED: {
              try {
                const msg = await validateDto(
                  StartedGooseGameMatchPubSubEventDto,
                  parsedMessage,
                );
                this.server.emit(WEBSOCKET_CHANEL_SEND.MATCH_STARTED, msg);
              } catch (error) {
                console.error(error.message);
              }
              break;
            }

            case REDIS_EVENTS.GOOSE_MATCH_ENDED: {
              try {
                const msg = await validateDto(
                  EndedGooseGameMatchPubSubEventDto,
                  parsedMessage,
                );
                this.server.emit(WEBSOCKET_CHANEL_SEND.MATCH_ENDED, msg);
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
                const msg = await validateDto(GooseGameMatchDto, parsedMessage);
                this.server.emit(WEBSOCKET_CHANEL_SEND.MATCH_CREATED, msg);
              } catch (error) {
                console.error(error.message);
              }
              break;
            }
            case REDIS_EVENTS.GOOSE_MATCH_USER_JOINED: {
              try {
                const msg = await validateDto(
                  UserJoinedGooseMatchPubSubEventDto,
                  parsedMessage,
                );

                const {
                  matchPlayerInfo: { id },
                  matchId,
                } = msg;
                const userSockets = this.usersSockets.getUserSockets(id);
                const roomKey = WEBSOCKET_ROOM.getMatchRoomKey(matchId);
                for (const socket of userSockets) {
                  await socket.join(roomKey);
                }
                this.server.emit(WEBSOCKET_CHANEL_SEND.USER_JOINED, msg);
              } catch (error) {
                console.error(error.message);
              }
              break;
            }

            case REDIS_EVENTS.GOOSE_MATCH_USER_LEAVE: {
              try {
                const msg = await validateDto(
                  UserLeaveGooseMatchPubSubEventDto,
                  parsedMessage,
                );

                const { playerId, matchId } = msg;
                const userSockets = this.usersSockets.getUserSockets(playerId);
                const roomKey = WEBSOCKET_ROOM.getMatchRoomKey(matchId);
                for (const socket of userSockets) {
                  await socket.leave(roomKey);
                }
                this.server.emit(WEBSOCKET_CHANEL_SEND.USER_LEAVE, msg);
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
    const playerId = client.user.id;
    if (!playerId || typeof playerId !== 'string') {
      client.disconnect(true);
      return;
    }

    // присоединяемся к комнатам для событий из активных игр:
    const userMatchesIds =
      await this.helper.getPlayerMatchesIdsFromCache(playerId);
    const promises = [...userMatchesIds].map(async (matchId) => {
      const roomKey = WEBSOCKET_ROOM.getMatchRoomKey(matchId);
      await client.join(roomKey);
    });
    await Promise.all(promises);
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
    message: { payload: CreateGooseMatchRequestDto },
    summary: 'Client requests to create a new match',
  })
  @AsyncApiPub({
    channel: WEBSOCKET_CHANEL_SEND.MATCH_CREATED,
    message: { payload: GooseGameMatchDto },
    summary: 'Response when a match is created',
  })
  @Roles(UserRoleEnum.ADMIN)
  @UseGuards(RolesGuard)
  @SubscribeMessage(WEBSOCKET_CHANEL_LISTEN.CREATE_MATCH)
  async handleCreateMatch(
    @MessageBody() dto: CreateGooseMatchRequestDto,
    @ConnectedSocket() client: JwtSocket,
  ) {
    try {
      const matchId = await this.gameService.createMatch(client.user, dto);
      return getStatusOkResponse({
        matchId,
      });
    } catch (err) {
      return getStatusErrorResponse(err.message);
    }
  }

  @AsyncApiSub({
    channel: WEBSOCKET_CHANEL_LISTEN.MATCH_USER_JOIN,
    message: { payload: UserJoinOrLeaveGooseMatchRequestDto },
    summary: 'Client requests to join a match',
  })
  @AsyncApiPub({
    channel: WEBSOCKET_CHANEL_SEND.USER_JOINED,
    message: { payload: UserJoinedGooseMatchPubSubEventDto },
    summary: 'Response when a user successfully joins a match',
  })
  @SubscribeMessage(WEBSOCKET_CHANEL_LISTEN.MATCH_USER_JOIN)
  async handleUserJoinToMatch(
    @MessageBody() dto: UserJoinOrLeaveGooseMatchRequestDto,
    @ConnectedSocket() client: JwtSocket,
  ) {
    try {
      await this.gameService.addPlayerToMatch(dto.matchId, client.user.id);
      return getStatusOkResponse();
    } catch (err) {
      return getStatusErrorResponse(err.message);
    }
  }

  @AsyncApiSub({
    channel: WEBSOCKET_CHANEL_LISTEN.MATCH_USER_LEAVE,
    message: { payload: UserJoinOrLeaveGooseMatchRequestDto },
    summary: 'Client requests to leave a match',
  })
  @AsyncApiPub({
    channel: WEBSOCKET_CHANEL_SEND.USER_LEAVE,
    message: { payload: UserLeaveGooseMatchPubSubEventDto },
    summary: 'Response when a user successfully leaves a match',
  })
  @SubscribeMessage(WEBSOCKET_CHANEL_LISTEN.MATCH_USER_LEAVE)
  async handleUserLeaveFromMatch(
    @MessageBody() dto: UserJoinOrLeaveGooseMatchRequestDto,
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
    message: { payload: TapGooseRequestDto },
    summary: 'Client requests to tap the goose (score points)',
  })
  @AsyncApiPub({
    channel: WEBSOCKET_CHANEL_SEND.GOOSE_TAP_SUCCESS,
    message: { payload: UserGooseTapPubSubEventDto },
    summary: 'Response when a tap is successful',
  })
  @SubscribeMessage(WEBSOCKET_CHANEL_LISTEN.GOOSE_TAP)
  async handleTapGoose(
    @MessageBody() data: TapGooseRequestDto,
    @ConnectedSocket() client: JwtSocket,
  ) {
    try {
      await this.gameService.tapGoose(data.matchId, client.user);
      return getStatusOkResponse();
    } catch (err) {
      return getStatusErrorResponse(err.message);
    }
  }
}
