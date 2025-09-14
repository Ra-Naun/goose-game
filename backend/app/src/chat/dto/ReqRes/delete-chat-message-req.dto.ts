import { IsString } from 'class-validator';

export interface DeleteChatMessageReqData {
  messageId: string;
}

export class DeleteChatMessageReqDto implements DeleteChatMessageReqData {
  @IsString()
  messageId: string;
}
