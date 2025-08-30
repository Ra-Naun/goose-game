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
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Socket, Server } from 'socket.io';
import { TapGooseGameService } from './tap-goose-game.service';
import { REDIS_EVENTS, WEBSOCKET_CHANEL, WEBSOCKET_ROOM } from './config';

import { AsyncApiPub, AsyncApiSub } from 'nestjs-asyncapi';
import {
  CreateMatchDto,
  GameMatchDto,
  MatchCreatedDto,
  TapErrorDto,
  TapGooseDto,
  TapSuccessDto,
  UpdateGooseGameMatchPubSubEventDto,
  UserGooseTapPubSubEventDto,
  UserJoinedOrLeftMatchPubSubEventDto,
} from './dto';
import { TapGooseGamePubSubService } from './pub-sub.service';
import { UseGuards } from '@nestjs/common';
import { WsAuthGuard } from 'src/auth/guards/ws-auth.guard';
import { WsAuthDecorator } from 'src/auth/decorators/ws-auth.decorator';
import { UsersService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/user/dto/types';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import type { JwtSocket } from 'src/types/socket-user';
import { validatePubSubMessage } from './utils';

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
    private readonly tapGooseGameService: TapGooseGameService,
    private readonly pubSubService: TapGooseGamePubSubService,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  async afterInit() {
    // Подписка на Pub/Sub для синхронизации событий между инстансами

    const subscribeChannels = [
      REDIS_EVENTS.GOOSE_MATCH_STATE,
      REDIS_EVENTS.GOOSE_MATCH_TAP,
      REDIS_EVENTS.GOOSE_MATCH_CREATED,
      REDIS_EVENTS.GOOSE_MATCH_USER_JOINED,
      REDIS_EVENTS.GOOSE_MATCH_USER_LEFT,
    ];

    await this.pubSubService.subscribe(
      subscribeChannels,
      async (channel, message) => {
        try {
          const parsedMessage = JSON.parse(message);
          switch (channel) {
            case REDIS_EVENTS.GOOSE_MATCH_STATE: {
              try {
                const msg = await validatePubSubMessage(
                  UpdateGooseGameMatchPubSubEventDto,
                  parsedMessage,
                );
                this.server.emit(WEBSOCKET_CHANEL.MATCH_STATE, msg);
              } catch (error) {
                console.error(error.message);
              }
              break;
            }
            case REDIS_EVENTS.GOOSE_MATCH_TAP: {
              try {
                const msg = await validatePubSubMessage(
                  UserGooseTapPubSubEventDto,
                  parsedMessage,
                );
                const { matchId } = msg;
                const roomKey = WEBSOCKET_ROOM.getMatchRoomKey(matchId);
                // Отправляем только в комнату матча
                this.server
                  .to(roomKey)
                  .emit(WEBSOCKET_CHANEL.GOOSE_TAP_SUCCESS, msg);
              } catch (error) {
                console.error(error.message);
              }
              break;
            }
            case REDIS_EVENTS.GOOSE_MATCH_CREATED: {
              try {
                const msg = await validatePubSubMessage(
                  GameMatchDto,
                  parsedMessage,
                );
                this.server.emit(WEBSOCKET_CHANEL.MATCH_CREATED, msg);
              } catch (error) {
                console.error(error.message);
              }
              break;
            }
            case REDIS_EVENTS.GOOSE_MATCH_USER_JOINED: {
              try {
                const msg = await validatePubSubMessage(
                  UserJoinedOrLeftMatchPubSubEventDto,
                  parsedMessage,
                );

                const { playerId, matchId } = msg;
                const userSockets = this.usersSockets.getUserSockets(playerId);
                const roomKey = WEBSOCKET_ROOM.getMatchRoomKey(matchId);
                for (const socket of userSockets) {
                  await socket.join(roomKey);
                }
                this.server.emit(WEBSOCKET_CHANEL.MATCH_USER_JOIN_SUCCESS, msg);
              } catch (error) {
                console.error(error.message);
              }
              break;
            }

            case REDIS_EVENTS.GOOSE_MATCH_USER_LEFT: {
              try {
                const msg = await validatePubSubMessage(
                  UserJoinedOrLeftMatchPubSubEventDto,
                  parsedMessage,
                );

                const { playerId, matchId } = msg;
                const userSockets = this.usersSockets.getUserSockets(playerId);
                const roomKey = WEBSOCKET_ROOM.getMatchRoomKey(matchId);
                for (const socket of userSockets) {
                  await socket.leave(roomKey);
                }
                this.server.emit(WEBSOCKET_CHANEL.MATCH_USER_LEFT_SUCCESS, msg);
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

  @WsAuthDecorator()
  handleConnection(client: JwtSocket) {
    const playerId = client.user.id;
    if (!playerId || typeof playerId !== 'string') {
      client.disconnect(true);
      return;
    }
    this.usersSockets.registerUserSocket(playerId, client);
    console.log(`Client connected: ${client.id} ${playerId}`);
  }

  @WsAuthDecorator()
  handleDisconnect(client: JwtSocket) {
    // Можно добавить логику выхода игрока, например добавить отображение статуса оффлайн
    const playerId = client.user?.id;
    if (playerId && typeof playerId === 'string') {
      this.usersSockets.unregisterUserSocket(playerId, client);
      console.log(`Client disconnected: ${client.id} ${playerId}`);
    }
  }

  @AsyncApiSub({
    channel: WEBSOCKET_CHANEL.CREATE_MATCH,
    message: { payload: CreateMatchDto },
    summary: 'Client requests to create a new match',
  })
  @AsyncApiPub({
    channel: WEBSOCKET_CHANEL.MATCH_CREATED,
    message: { payload: MatchCreatedDto },
    summary: 'Response when a match is created',
  })
  @AsyncApiPub({
    channel: WEBSOCKET_CHANEL.CREATE_MATCH_ERROR,
    message: { payload: TapErrorDto },
    summary: 'Error response when creating a match fails',
  })
  @UseGuards(WsAuthGuard)
  @Roles(UserRole.USER)
  @UseGuards(RolesGuard)
  @SubscribeMessage(WEBSOCKET_CHANEL.CREATE_MATCH)
  async handleCreateMatch(@ConnectedSocket() client: JwtSocket) {
    try {
      await this.tapGooseGameService.createMatch(client.user.id);
    } catch (err) {
      client.emit(WEBSOCKET_CHANEL.CREATE_MATCH_ERROR, {
        message: 'Failed to create match',
      });
    }
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage(WEBSOCKET_CHANEL.MATCH_USER_JOIN)
  async handleUserJoinToMatch(
    @MessageBody() data: { matchId: string },
    @ConnectedSocket() client: JwtSocket,
  ) {
    try {
      await this.tapGooseGameService.addPlayerToMatch(
        data.matchId,
        client.user.id,
      );
    } catch (err) {
      client.emit(WEBSOCKET_CHANEL.MATCH_USER_JOIN_ERROR, {
        message: err.message,
      });
    }
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage(WEBSOCKET_CHANEL.MATCH_USER_LEFT)
  async handleUserLeftFromMatch(
    @MessageBody() data: { matchId: string },
    @ConnectedSocket() client: JwtSocket,
  ) {
    try {
      await this.tapGooseGameService.removePlayerFromMatch(
        data.matchId,
        client.user.id,
      );
    } catch (err) {
      client.emit(WEBSOCKET_CHANEL.MATCH_USER_LEFT_ERROR, {
        message: err.message,
      });
    }
  }

  @AsyncApiSub({
    channel: WEBSOCKET_CHANEL.GOOSE_TAP,
    message: { payload: TapGooseDto },
    summary: 'Client sends a tap event on goose',
  })
  @AsyncApiPub({
    channel: WEBSOCKET_CHANEL.GOOSE_TAP_SUCCESS,
    message: { payload: TapSuccessDto },
    summary: 'Response when clicking on the goose successfully',
  })
  @AsyncApiPub({
    channel: WEBSOCKET_CHANEL.GOOSE_TAP_ERROR,
    message: { payload: TapErrorDto },
    summary: 'Response when clicking on a goose error',
  })
  @UseGuards(WsAuthGuard)
  @SubscribeMessage(WEBSOCKET_CHANEL.GOOSE_TAP)
  async handleTapGoose(
    @MessageBody() data: TapGooseDto,
    @ConnectedSocket() client: JwtSocket,
  ) {
    try {
      await this.tapGooseGameService.tapGoose(
        data.matchId,
        client.user.id,
        data.tapCount,
      );
    } catch (err) {
      client.emit(WEBSOCKET_CHANEL.GOOSE_TAP_ERROR, { message: err.message });
    }
  }
}
