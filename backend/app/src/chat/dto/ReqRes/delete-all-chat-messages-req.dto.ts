import { IsString } from 'class-validator';

export interface DeleteAllChatMessagesReqData {
  channelId: string;
}

export class DeleteAllChatMessagesReqDto
  implements DeleteAllChatMessagesReqData {
  @IsString()
  channelId: string;
}
