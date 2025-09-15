import { IsString, MaxLength } from 'class-validator';
import { MAX_MESSAGE_LENGTH } from 'src/chat/config';

export interface CreateChatMessageReqData {
  channelId: string;
  content: string;
}

export class CreateChatMessageReqDto implements CreateChatMessageReqData {
  @IsString()
  channelId: string;

  @IsString()
  @MaxLength(MAX_MESSAGE_LENGTH, {
    message: `Content is too long. Max length is ${MAX_MESSAGE_LENGTH} characters`,
  })
  content: string;
}
