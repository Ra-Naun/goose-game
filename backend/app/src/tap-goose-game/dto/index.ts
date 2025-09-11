import {
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Validate,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

import { IsPlayersRecordConstraint } from './validators/players-record.validator';
import { MatchStatus } from '../types';
import { IsMatchStatusConstraint } from './validators/match-status.validator';
import { IsScoresRecordConstraint } from './validators/scores-record.validator';

export class CreateGooseMatchRequestDto {
  @IsString()
  title!: string;

  @IsInt()
  maxPlayers!: number;

  @IsInt()
  cooldownMs!: number;

  @IsInt()
  matchDurationSeconds!: number;
}

export class MatchPlayerInfoDto {
  @IsString()
  id!: string;

  @IsString()
  username!: string;

  @IsString()
  email!: string;
}

export class GooseGameMatchDto {
  @IsString()
  id!: string;

  @IsString()
  title!: string;

  @IsObject()
  @Validate(IsScoresRecordConstraint)
  scores!: Record<string, number>;

  @IsObject()
  @Validate(IsPlayersRecordConstraint)
  players!: Record<string, MatchPlayerInfoDto>;

  @IsInt()
  maxPlayers!: number;

  @IsInt()
  matchDurationSeconds!: number;

  @IsInt()
  cooldownMs!: number;

  @IsInt()
  createdTime!: number; // timestamp

  @Validate(IsMatchStatusConstraint)
  status!: MatchStatus;

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

export class StartedGooseGameMatchPubSubEventDto {
  @IsString()
  id!: string;

  @IsInt()
  startTime!: number;
}

export class EndedGooseGameMatchPubSubEventDto extends PartialType(
  GooseGameMatchDto,
) {
  @IsString()
  id!: string;

  @IsInt()
  endTime!: number;
}

export class TapGooseRequestDto {
  @IsString()
  matchId!: string;
}
export class UserGooseTapPubSubEventDto {
  @IsString()
  playerId!: string;

  @IsString()
  matchId!: string;

  @IsInt()
  score!: number;
}

export class UserJoinOrLeaveGooseMatchRequestDto {
  @IsString()
  matchId!: string;
}

export class UserJoinedGooseMatchPubSubEventDto {
  @IsObject()
  matchPlayerInfo!: MatchPlayerInfoDto;

  @IsString()
  matchId!: string;
}

export class UserLeaveGooseMatchPubSubEventDto {
  @IsString()
  playerId!: string;

  @IsString()
  matchId!: string;
}
