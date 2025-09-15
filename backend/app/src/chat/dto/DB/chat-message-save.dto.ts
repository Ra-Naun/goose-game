import { IsNumber, IsString } from 'class-validator';

export interface ChatMessageSaveData {
  userId: string;
  channelId: string;
  content: string;
  sendedAt: number;
}

export class ChatMessageSaveDto implements ChatMessageSaveData {
  @IsString()
  userId: string;

  @IsString()
  channelId: string;

  @IsString()
  content: string;

  @IsNumber()
  sendedAt: number;
}
