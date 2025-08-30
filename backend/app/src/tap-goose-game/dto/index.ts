import {
  IsBoolean,
  IsInt,
  IsObject,
  IsString,
  Validate,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { IsPlayersRecordConstraint } from './validators/players-array.validator';

export class CreateMatchDto {
  players!: string[];
}

export class MatchCreatedDto {
  @IsString()
  matchId!: string;
  players!: string[];
  // опишите другие поля матча
}

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

export class GameMatchDto {
  @IsString()
  id: string;
  @IsObject()
  @Validate(IsPlayersRecordConstraint)
  players: Record<string, number>;
  @IsBoolean()
  started: boolean;
  @IsBoolean()
  ended: boolean;
  @IsInt()
  startTime: number; // timestamp начала раунда
  @IsInt()
  cooldownEndTime: number; // timestamp окончания обратного отсчёта
  @IsInt()
  endTime: number; // timestamp окончания раунда
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
