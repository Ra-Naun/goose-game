import {
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { UserInfo, UserInfoDto } from '../../../user/dto/user.info.dto';
import { Type } from 'class-transformer';

export interface ChatMessageRes {
  id: string;
  userInfo: UserInfo;
  channelId: string;
  content: string;
  sendedAt: number;
  createdAt: number;
  updatedAt?: number;
}

export class ChatMessageResDto implements ChatMessageRes {
  @IsString()
  id: string;

  @ValidateNested()
  @Type(() => UserInfoDto)
  userInfo: UserInfoDto;

  @IsString()
  channelId: string;

  @IsString()
  content: string;

  @IsNumber()
  sendedAt: number;

  @IsNumber()
  createdAt: number;

  @IsOptional()
  @IsNumber()
  updatedAt?: number;
}
