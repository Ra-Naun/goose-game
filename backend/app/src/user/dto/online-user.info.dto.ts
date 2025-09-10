import { IsArray, IsBoolean, IsString, Validate } from 'class-validator';
import { UserRoleEnum } from './types';
import { IsUserRoleArrayConstraint } from './validators/roles-array.validator';

export class OnlineUserInfoDto {
  @IsString()
  id: string;

  @IsString()
  email: string;

  @IsString()
  username: string;

  @IsString()
  avatarUrl: string;

  @IsArray()
  @Validate(IsUserRoleArrayConstraint)
  roles: UserRoleEnum[];

  @IsBoolean()
  isOnline!: boolean;
}
