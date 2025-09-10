import { IsBoolean, IsString } from 'class-validator';

export class OnlineUserChangedPubSubEventDto {
  @IsString()
  playerId!: string;

  @IsBoolean()
  isOnline!: boolean;
}
