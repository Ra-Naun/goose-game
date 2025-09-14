import { IsString } from 'class-validator';

export interface DeleteAllChatMessagesResData {
  channelId: string;
}

export class DeleteAllChatMessagesResDto
  implements DeleteAllChatMessagesResData {
  @IsString()
  channelId: string;
}
