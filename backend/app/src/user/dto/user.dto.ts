import { IsDate, IsString } from 'class-validator';
import { UserRole } from './types';
import { User } from '@prisma/client';

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
  roles: UserRole[];

  static fromDatabaseItem(item: User) {
    const userDto = new UserDto();
    userDto.id = item.id;
    userDto.email = item.email;
    userDto.username = item.username;
    userDto.hashedPassword = item.hashedPassword;
    userDto.createdAt = item.createdAt;
    userDto.updatedAt = item.updatedAt;
    userDto.roles = item.roles as UserRole[];
    return userDto;
  }
}
