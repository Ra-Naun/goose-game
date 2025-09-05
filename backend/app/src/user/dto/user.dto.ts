import { IsDate, IsString } from 'class-validator';
import { UserRoleEnum } from './types';
import { $Enums, User } from '@prisma/client';
import { UserInfoDto } from 'src/tap-goose-game/dto';

const USER_ROLES_MAP: { [key in $Enums.UserRole]: UserRoleEnum } = {
  ADMIN: UserRoleEnum.ADMIN,
  USER: UserRoleEnum.USER,
  NIKITA: UserRoleEnum.NIKITA,
};

const parsePrismaUserRoleToEnum = (
  roles: $Enums.UserRole[],
): UserRoleEnum[] => {
  return roles.map((role) => USER_ROLES_MAP[role]);
};

export type SerializedUserForUI = Omit<UserDto, 'hashedPassword'>;

export type OnlineUsers = UserInfoDto[];
export class UserDto {
  @IsString()
  id: string;

  @IsString()
  email: string;

  @IsString()
  username: string;

  @IsString()
  hashedPassword: string;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  @IsString()
  roles: UserRoleEnum[];

  static fromDatabaseItem(item: User) {
    const userDto = new UserDto();
    userDto.id = item.id;
    userDto.email = item.email;
    userDto.username = item.username;
    userDto.hashedPassword = item.hashedPassword;
    userDto.createdAt = item.createdAt;
    userDto.updatedAt = item.updatedAt;
    userDto.roles = parsePrismaUserRoleToEnum(item.roles);
    return userDto;
  }

  static serializeForUI(item: UserDto): SerializedUserForUI {
    const { hashedPassword: _, ...data } = item;
    return data;
  }
}
