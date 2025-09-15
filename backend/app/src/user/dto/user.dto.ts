import { IsArray, IsDate, IsString } from 'class-validator';
import { User } from '@prisma/client';

import { UserRoleEnum } from './types';
import { validateDto } from 'src/utils/validateDto';

export type SerializedUserForUI = Omit<UserDto, 'hashedPassword'>;

export class UserDto {
  @IsString()
  id!: string;

  @IsString()
  email!: string;

  @IsString()
  username!: string;

  @IsString()
  avatarUrl!: string;

  @IsString()
  hashedPassword!: string;

  @IsDate()
  createdAt!: Date;

  @IsDate()
  updatedAt!: Date;

  @IsArray()
  roles!: UserRoleEnum[];

  static async fromDatabaseItem(item: User) {
    const userDto = await validateDto(UserDto, {
      ...item,
    });
    return userDto;
  }

  static serializeForUI(item: UserDto): SerializedUserForUI {
    const { hashedPassword: _, ...data } = item;
    return data;
  }
}
