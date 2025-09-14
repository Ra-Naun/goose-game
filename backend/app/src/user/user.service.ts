import { ConflictException, Injectable } from '@nestjs/common';
import { hashPassword } from 'libs/crypto';
import { getUserRoleOnCreate as getUserRolesOnCreate } from './utils';
import { PrismaService } from 'src/prisma/prisma.service';
import { REDIS_KEYS } from 'src/tap-goose-game/config';
import { ExternalCacheService } from 'src/external-cache/external-cache.service';
import {
  REDIS_EVENTS,
  USER_ONLINE_EXPIRATION,
  USER_ONLINE_KEY_REGEX,
} from './config';
import { PubSubService } from 'src/pub-sub/pub-sub.service';

import {
  UserDto,
  OnlineUserChangedPubSubEventData,
  OnlineUserChangedPubSubEventDto,
  OnlineUserInfo,
  OnlineUserInfoDto,
  OnlineUsers,
  UpdateUserDto,
  CreateUserDto,
} from './dto';
import { validateDto } from 'src/utils/validateDto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: ExternalCacheService,
    private readonly pubSubService: PubSubService,
  ) { }

  async findByEmail(email: string): Promise<UserDto | null> {
    const item = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!item) {
      return null;
    }

    const userDto = await UserDto.fromDatabaseItem(item);
    return userDto;
  }

  async findById(id: string): Promise<UserDto | null> {
    const item = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!item) {
      return null;
    }

    const userDto = await UserDto.fromDatabaseItem(item);
    return userDto;
  }

  async create(dto: CreateUserDto): Promise<UserDto> {
    const { password, email, username } = dto;
    const roles = getUserRolesOnCreate(dto);
    const hashedPassword = await hashPassword(password);

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const item = await this.prisma.user.create({
      data: { username, email, roles, hashedPassword },
    });

    return await UserDto.fromDatabaseItem(item);
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserDto> {
    const { password, ...other } = dto;

    const updateData = {
      ...(password ? { hashedPassword: await hashPassword(password) } : {}),
      ...other,
    };

    const item = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    const userDto = await UserDto.fromDatabaseItem(item);
    return userDto;
  }

  async getOnlineUsers(): Promise<OnlineUsers> {
    const keys = await this.cacheService.getKeysByPattern(
      REDIS_KEYS.getUserOnlineKey('*'),
    );
    const onlineUsers: OnlineUserInfoDto[] = [];
    for (const key of keys || []) {
      const isOnline = await this.cacheService.get<boolean>(key);
      if (isOnline) {
        const match = key.match(USER_ONLINE_KEY_REGEX);
        if (match && match[1]) {
          const userId = match[1];
          const user = await this.findById(userId);
          if (!user) {
            continue;
          }
          const userInfo: OnlineUserInfo = {
            id: user.id,
            email: user.email,
            username: user.username,
            avatarUrl: user.avatarUrl,
            roles: user.roles,
            isOnline: true,
          };
          const userInfoValidated = await validateDto(
            OnlineUserInfoDto,
            userInfo,
          );

          onlineUsers.push(userInfoValidated);
        }
      }
    }

    return onlineUsers;
  }

  async IMOnline(playerId: string): Promise<void> {
    const key = REDIS_KEYS.getUserOnlineKey(playerId);

    const isOnline = await this.cacheService.get<boolean>(key);
    await this.cacheService.set(key, true, USER_ONLINE_EXPIRATION);

    setTimeout(
      async () => {
        const isOnline = await this.cacheService.get<boolean>(key);
        if (!isOnline) {
          const data: OnlineUserChangedPubSubEventData = {
            playerId,
            isOnline: false,
          };
          const msg = await validateDto(OnlineUserChangedPubSubEventDto, data);
          await this.pubSubService.publish(
            REDIS_EVENTS.ONLINE_USERS_CHANGED,
            JSON.stringify([msg]),
          );
        }
      },
      (USER_ONLINE_EXPIRATION + 10) * 1000,
    ); // +10 seconds buffer

    if (isOnline) return; // already online, no need to notify
    const data: OnlineUserChangedPubSubEventData = {
      playerId,
      isOnline: true,
    };
    const msg = await validateDto(OnlineUserChangedPubSubEventDto, data);
    await this.pubSubService.publish(
      REDIS_EVENTS.ONLINE_USERS_CHANGED,
      JSON.stringify([msg]),
    );
  }
}
