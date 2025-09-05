import {
  IsArray,
  IsBoolean,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Validate,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { IsPlayersRecordConstraint } from './validators/players-array.validator';
import { MatchStatus } from '../types';
import { IsMatchStatusConstraint } from './validators/match-status.validator';
import { UserRoleEnum } from 'src/user/dto/types';
import { IsUserRoleArrayConstraint } from './validators/roles-array.validator';

export class TapGooseDto {
  @IsString()
  matchId!: string;

  @IsString()
  @IsInt()
  tapCount!: number;
}

export class TapSuccessDto {
  @IsString()
  playerId!: string;

  @IsString()
  matchId!: string;

  @IsInt()
  score!: number;
}

export class TapErrorDto {
  @IsString()
  message!: string;
}

export class MatchCreatedDto {
  @IsString()
  id!: string;

  players!: string[];
}
export class GameMatchDto {
  @IsString()
  id: string;

  @IsString()
  title: string;

  @IsObject()
  @Validate(IsPlayersRecordConstraint)
  players: Record<string, number>;

  @IsInt()
  maxPlayers: number;

  @IsInt()
  matchDurationSeconds: number;

  @IsInt()
  cooldownMs: number;

  @IsInt()
  createdTime: number; // timestamp

  @Validate(IsMatchStatusConstraint)
  status: MatchStatus;

  @IsOptional()
  @IsInt()
  startTime?: number; // timestamp начала раунда

  @IsOptional()
  @IsInt()
  cooldownEndTime: number; // timestamp окончания обратного отсчёта

  @IsOptional()
  @IsInt()
  endTime?: number; // timestamp окончания раунда
}

export class UpdateGooseGameMatchPubSubEventDto extends PartialType(
  GameMatchDto,
) { }

export class UserGooseTapPubSubEventDto extends TapSuccessDto { }

export class UserJoinedOrLeftMatchPubSubEventDto {
  @IsString()
  playerId!: string;

  @IsString()
  matchId!: string;
}

export class UserOnlineChangedPubSubEventDto {
  @IsString()
  playerId!: string;

  @IsBoolean()
  isOnline!: boolean;
}

export class UserInfoDto {
  @IsString()
  id: string;

  @IsString()
  email: string;

  @IsString()
  username: string;

  @IsArray()
  @Validate(IsUserRoleArrayConstraint)
  roles: UserRoleEnum[];

  @IsBoolean()
  isOnline!: boolean;
}

export class CreateMatchDto {
  @IsString()
  title: string;

  @IsInt()
  maxPlayers: number;

  @IsInt()
  cooldownMs: number;

  @IsInt()
  matchDurationSeconds: number;
}

export class UserJoinOrLeftMatchDto {
  @IsString()
  matchId: string;
}
