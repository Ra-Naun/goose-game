import { IsArray, IsString, Validate } from 'class-validator';
import { UserRoleEnum } from './types';
import { IsUserRoleArrayConstraint } from './validators/roles-array.validator';

export interface UserInfo {
  id: string;
  email: string;
  username: string;
  avatarUrl: string;
  roles: UserRoleEnum[];
}

export class UserInfoDto implements UserInfo {
  @IsString()
  id!: string;

  @IsString()
  email!: string;

  @IsString()
  username!: string;

  @IsString()
  avatarUrl!: string;

  @IsArray()
  @Validate(IsUserRoleArrayConstraint)
  roles!: UserRoleEnum[];
}
