import { IsString } from 'class-validator';

export interface DeleteChatMessageResData {
  messageId: string;
}

export class DeleteChatMessageResDto implements DeleteChatMessageResData {
  @IsString()
  messageId: string;
}
