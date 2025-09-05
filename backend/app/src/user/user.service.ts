import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '@prisma/client';
import { hashPassword } from 'services/crypto';
import { UpdateUserDto } from './dto/update-user.dto';
import { OnlineUsers, UserDto } from './dto/user.dto';
import { getUserRoleOnCreate as getUserRolesOnCreate } from './utils';
import { PrismaService } from 'src/prisma/prisma.service';
import { REDIS_KEYS } from 'src/tap-goose-game/config';
import { ExternalCacheService } from 'src/external-cache/external-cache.service';
import { UserInfoDto } from 'src/tap-goose-game/dto';
import { validateDto } from 'src/tap-goose-game/utils';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: ExternalCacheService,
  ) { }

  async findByEmail(email: User['email']): Promise<UserDto | null> {
    const item = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!item) {
      return null;
    }

    const userDto = UserDto.fromDatabaseItem(item);
    return userDto;
  }

  async findById(id: User['id']): Promise<UserDto | null> {
    const item = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!item) {
      return null;
    }

    const userDto = UserDto.fromDatabaseItem(item);
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

    return UserDto.fromDatabaseItem(item);
  }

  async update(id: User['id'], dto: UpdateUserDto): Promise<UserDto> {
    const { password, ...other } = dto;

    const updateData = {
      ...(password ? { hashedPassword: await hashPassword(password) } : {}),
      ...other,
    };

    const item = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    const userDto = UserDto.fromDatabaseItem(item);
    return userDto;
  }

  async getOnlineUsers(): Promise<OnlineUsers> {
    const keys = await this.cacheService.getKeysByPattern(
      REDIS_KEYS.getUserOnlineKey('*'),
    );
    const onlineUsers: UserInfoDto[] = [];
    for (const key of keys || []) {
      const isOnline = await this.cacheService.get<boolean>(key);
      if (isOnline) {
        const match = key.match(/^goose:user:(.*):online$/);
        if (match && match[1]) {
          const userId = match[1];
          const user = await this.findById(userId);
          if (!user) {
            continue;
          }
          const userInfo: UserInfoDto = {
            id: user.id,
            email: user.email,
            username: user.username,
            roles: user.roles,
            isOnline: true,
          };
          const userInfoValidated = await validateDto(UserInfoDto, userInfo);

          onlineUsers.push(userInfoValidated);
        }
      }
    }

    return onlineUsers;
  }
}
