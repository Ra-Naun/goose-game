import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { COMMON_CHAT_ID, REDIS_EVENTS } from './config';
import { PubSubService } from 'src/pub-sub/pub-sub.service';
import { validateDto } from 'src/utils/validateDto';
import {
  ChatMessageResDto,
  CreateChatMessageReqDto,
  DeleteChatMessageReqDto,
  DeleteAllChatMessagesReqDto,
  ChatMessageRes,
} from './dto';
import { UserDto } from 'src/user/dto';
import { ChatMessageSaveDto } from './dto/DB/chat-message-save.dto';
import {
  DeleteChatMessageResData,
  DeleteChatMessageResDto,
} from './dto/ReqRes/delete-chat-message-res.dto';
import { UserRoleEnum } from 'src/user/dto/types';
import {
  DeleteAllChatMessagesResData,
  DeleteAllChatMessagesResDto,
} from './dto/ReqRes/delete-all-chat-messages-res.dto';

@Injectable()
export class ChatService {
  constructor(
    private readonly pubSubService: PubSubService,
    private readonly prisma: PrismaService,
  ) { }

  /**
   * Отправляет новое сообщение в канал.
   * Валидация dto происходит до сохранения.
   * Пользователь должен быть участником канала.
   */
  async sendMessage(
    user: UserDto,
    dto: CreateChatMessageReqDto,
  ): Promise<string> {
    // Валидация входного DTO
    await validateDto(CreateChatMessageReqDto, dto);

    // Проверка, что пользователь имеет доступ к каналу
    const hasAccess = await this.checkUserAccessToChannel(
      user.id,
      dto.channelId,
    );
    if (!hasAccess) {
      throw new ForbiddenException('User has no access to this channel');
    }

    // Формируем DTO для сохранения и валидации
    const chatMessageSaveDto = new ChatMessageSaveDto();
    chatMessageSaveDto.userId = user.id;
    chatMessageSaveDto.channelId = dto.channelId;
    chatMessageSaveDto.content = dto.content;
    chatMessageSaveDto.sendedAt = Date.now();

    // Валидация ChatMessageSaveDto
    await validateDto(ChatMessageSaveDto, chatMessageSaveDto);

    // Сохраняем сообщение в БД
    const messageId = await this.saveMessageToDb(chatMessageSaveDto);
    const savedMessageDto = await this.getMessageById(messageId);

    // Публикуем событие для подписчиков
    await this.pubSubService.publish(
      REDIS_EVENTS.SEND_MESSAGE,
      JSON.stringify(savedMessageDto),
    );

    return messageId;
  }

  private async saveMessageToDb(
    chatMessage: ChatMessageSaveDto,
  ): Promise<string> {
    const saveData = {
      data: {
        channelId: chatMessage.channelId,
        content: chatMessage.content,
        sendedAt: new Date(chatMessage.sendedAt),
        userId: chatMessage.userId,
      },
    };
    const res = await this.prisma.chatMessage.create(saveData);
    return res.id as string;
  }

  // Проверка доступа пользователя к указанному каналу (пример, подстройте под логику)
  private async checkUserAccessToChannel(
    userId: string,
    channelId: string,
  ): Promise<boolean> {
    if (channelId === COMMON_CHAT_ID) {
      return true;
    }
    //
    return false;
    // Можно проверять в базе, кэшах, или внешних сервисах
    // const membership = await this.prisma.channelMembership.findFirst({
    //   where: { userId, channelId: channelId },
    // });
    // return !!membership;
  }

  /**
   * Получение сообщений из канала с возможностью пагинации в будущем.
   * Пользователь должен иметь доступ к каналу.
   */
  async getChanelMessages(
    user: UserDto,
    channelId: string,
  ): Promise<ChatMessageResDto[]> {
    const hasAccess = await this.checkUserAccessToChannel(user.id, channelId);
    if (!hasAccess) {
      throw new ForbiddenException('User has no access to this channel');
    }

    // Пример выборки из Prisma с сортировкой по времени
    const messagesRaw = await this.prisma.chatMessage.findMany({
      where: { channelId },
      include: {
        user: true,
      },
      orderBy: { sendedAt: 'asc' },
      // TODO добавить пагинацию при необходимости, limit-offset или курсоры
    });

    // Преобразуем в DTO с вложенным userInfo
    const messagesPromises: Array<Promise<ChatMessageResDto>> = [];
    messagesRaw.forEach((msg) => {
      const chatMessageData: ChatMessageRes = {
        id: msg.id,
        channelId: msg.channelId,
        content: msg.content,
        sendedAt: msg.sendedAt.getTime(),
        createdAt: msg.createdAt.getTime(),
        updatedAt: msg.updatedAt.getTime(),
        userInfo: {
          id: msg.user.id,
          email: msg.user.email,
          username: msg.user.username,
          avatarUrl: msg.user.avatarUrl,
          roles: msg.user.roles as Array<UserRoleEnum>,
        },
      };

      try {
        const messageDto = validateDto(ChatMessageResDto, chatMessageData);
        messagesPromises.push(messageDto);
      } catch (error) {
        console.error(error);
      }
    });

    return await Promise.all(messagesPromises);
  }

  /**
   * Удаление одного сообщения по ID.
   */
  async removeMessage(
    user: UserDto,
    dto: DeleteChatMessageReqDto,
  ): Promise<void> {
    await validateDto(DeleteChatMessageReqDto, dto);

    const message = await this.prisma.chatMessage.findUnique({
      where: { id: dto.messageId },
      include: { user: true },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }
    const isAuthor = message.user.id === user.id;
    const isAdmin = user.roles.includes(UserRoleEnum.ADMIN);

    if (!isAuthor && !isAdmin) {
      throw new ForbiddenException(
        'You do not have permission to delete this message',
      );
    }

    await this.prisma.chatMessage.delete({ where: { id: dto.messageId } });

    const pubMessageData: DeleteChatMessageResData = {
      messageId: dto.messageId,
    };
    const pubMessageDto: DeleteChatMessageResDto = await validateDto(
      DeleteChatMessageResDto,
      pubMessageData,
    );

    // Публикуем событие удаления
    await this.pubSubService.publish(
      REDIS_EVENTS.DELETE_MESSAGE,
      JSON.stringify(pubMessageDto),
    );
  }

  /**
   * Удаление всех сообщений из канала.
   * Добавить проверку прав пользователя.
   */
  async removeAllMessages(
    user: UserDto,
    dto: DeleteAllChatMessagesReqDto,
  ): Promise<void> {
    await validateDto(DeleteAllChatMessagesReqDto, dto);

    if (user) {
      const hasAccess = user.roles.includes(UserRoleEnum.ADMIN);
      if (!hasAccess) {
        throw new ForbiddenException('User has no access to this action');
      }
    }

    await this.prisma.chatMessage.deleteMany({
      where: { channelId: dto.channelId },
    });

    const pubDeleteAllMessagesData: DeleteAllChatMessagesResData = {
      channelId: dto.channelId,
    };
    const pubDeleteAllMessagesDto: DeleteAllChatMessagesResDto =
      await validateDto(DeleteAllChatMessagesResDto, pubDeleteAllMessagesData);

    await this.pubSubService.publish(
      REDIS_EVENTS.DELETE_ALL_MESSAGES,
      JSON.stringify(pubDeleteAllMessagesDto),
    );
  }

  private async getMessageById(id: string): Promise<ChatMessageResDto> {
    const message = await this.prisma.chatMessage.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!message) {
      throw new NotFoundException(`Chat message with id "${id}" not found`);
    }

    const chatMessageData: ChatMessageRes = {
      id: message.id,
      channelId: message.channelId,
      content: message.content,
      sendedAt: message.sendedAt?.getTime(),
      createdAt: message.createdAt.getTime(),
      updatedAt: message.updatedAt?.getTime(),
      userInfo: {
        id: message.user.id,
        email: message.user.email,
        username: message.user.username,
        avatarUrl: message.user.avatarUrl,
        roles: message.user.roles as Array<UserRoleEnum>,
      },
    };

    const chatMessageDto = validateDto(ChatMessageResDto, chatMessageData);

    return chatMessageDto;
  }
}
