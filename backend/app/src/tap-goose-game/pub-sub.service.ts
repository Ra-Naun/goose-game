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
export class TapGooseGamePubSubService
  implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TapGooseGamePubSubService.name);

  private subscriber: Redis;
  private publisher: Redis;

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
  }

  async onModuleDestroy() {
    await this.subscriber.quit();
    await this.publisher.quit();
  }

  async subscribe(channels: string[] | string, handler: RedisMessageHandler) {
    if (typeof channels === 'string') {
      channels = [channels];
    }

    await this.subscriber.subscribe(...channels);

    this.subscriber.on('message', (channel, message) => {
      handler(channel, message);
    });

    this.logger.log(`Subscribed to Redis channels: ${channels.join(', ')}`);
  }

  async publish(channel: string, message: string) {
    await this.publisher.publish(channel, message);
    this.logger.debug(`Published message to channel ${channel}`);
  }
}
