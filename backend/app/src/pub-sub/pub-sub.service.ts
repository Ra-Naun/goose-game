import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';

type RedisMessageHandler = (channel: string, message: string) => void;

@Injectable()
export class PubSubService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PubSubService.name);

  private subscriber: Redis;
  private publisher: Redis;

  private handlers = new Map<string, RedisMessageHandler>();

  constructor(@InjectRedis() private readonly redis: Redis) {
    this.subscriber = new Redis(redis.options);
    this.publisher = new Redis(redis.options);
  }

  onModuleInit() {
    this.subscriber.on('error', (err) => {
      this.logger.error(`Redis subscriber error: ${err.message}`);
    });
    this.publisher.on('error', (err) => {
      this.logger.error(`Redis publisher error: ${err.message}`);
    });
    this.subscriber.on('message', this.handleMessage.bind(this));
  }

  async onModuleDestroy() {
    await Promise.all([this.subscriber.quit(), this.publisher.quit()]);
  }

  private handleMessage(channel: string, message: string) {
    const handler = this.handlers.get(channel);
    if (!handler) {
      this.logger.warn(`No handler found for channel: ${channel}`);
      return;
    }
    try {
      handler(channel, message);
    } catch (error) {
      this.logger.error(
        `Error in message handler for channel "${channel}": ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Подписаться на один или несколько каналов
   * @param channels Канал или массив каналов
   * @param handler Обработчик сообщений
   */
  async subscribe(channels: string[] | string, handler: RedisMessageHandler) {
    if (typeof channels === 'string') {
      channels = [channels];
    }

    const newChannels = channels.filter(
      (channel) => !this.handlers.has(channel),
    );
    if (newChannels.length === 0) {
      this.logger.debug(
        `Already subscribed to channels: ${channels.join(', ')}`,
      );
      return;
    }

    await this.subscriber.subscribe(...newChannels);
    newChannels.forEach((channel) => this.handlers.set(channel, handler));
    this.logger.log(`Subscribed to Redis channels: ${newChannels.join(', ')}`);
  }

  /**
   * Отписаться от каналов
   * @param channels Канал или массив каналов
   */
  async unsubscribe(channels: string | string[]) {
    if (typeof channels === 'string') {
      channels = [channels];
    }

    const existingChannels = channels.filter((channel) =>
      this.handlers.has(channel),
    );
    if (existingChannels.length === 0) {
      this.logger.debug(
        `No subscriptions found for channels: ${channels.join(', ')}`,
      );
      return;
    }

    await this.subscriber.unsubscribe(...existingChannels);

    existingChannels.forEach((channel) => this.handlers.delete(channel));

    this.logger.log(
      `Unsubscribed from Redis channels: ${existingChannels.join(', ')}`,
    );
  }

  /**
   * Отписаться от всех каналов
   */
  async unsubscribeAll() {
    const allChannels = Array.from(this.handlers.keys());
    if (allChannels.length === 0) return;
    await this.subscriber.unsubscribe(...allChannels);
    this.handlers.clear();
    this.logger.log('Unsubscribed from all Redis channels');
  }

  /**
   * Опубликовать сообщение в канал
   * @param channel Канал
   * @param message Сообщение
   */
  async publish(channel: string, message: string) {
    try {
      await this.publisher.publish(channel, message);
      this.logger.debug(`Published message to channel ${channel}`);
    } catch (error) {
      this.logger.error(
        `Failed to publish message to channel ${channel}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
