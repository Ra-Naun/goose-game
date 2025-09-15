import { IsBoolean } from 'class-validator';
import { UserInfo, UserInfoDto } from './user.info.dto';

export interface OnlineUserInfo extends UserInfo {
  isOnline: boolean;
}

export type OnlineUsers = OnlineUserInfoDto[];
export class OnlineUserInfoDto extends UserInfoDto implements OnlineUserInfo {
  @IsBoolean()
  isOnline!: boolean;
}
