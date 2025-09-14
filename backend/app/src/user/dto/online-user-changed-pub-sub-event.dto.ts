import { IsBoolean, IsString } from 'class-validator';

export interface OnlineUserChangedPubSubEventData {
  playerId: string;
  isOnline: boolean;
}

export class OnlineUserChangedPubSubEventDto
  implements OnlineUserChangedPubSubEventData {
  @IsString()
  playerId!: string;

  @IsBoolean()
  isOnline!: boolean;
}
