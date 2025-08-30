import { Injectable, Logger } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';

@Injectable()
export class ExternalCacheService {
  private readonly logger = new Logger(ExternalCacheService.name);

  constructor(@InjectRedis() private readonly redis: Redis) { }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    try {
      const data = JSON.stringify(value);
      if (ttlSeconds) {
        await this.redis.set(key, data, 'EX', ttlSeconds);
      } else {
        await this.redis.set(key, data);
      }
      this.logger.debug(`Cached key ${key} with TTL ${ttlSeconds || 'none'}`);
    } catch (error) {
      this.logger.error(`Failed to cache key ${key}: ${error.message}`);
      throw error;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redis.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      this.logger.error(
        `Failed to get key ${key} from cache: ${error.message}`,
      );
      throw error;
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
      this.logger.debug(`Deleted cache key ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete cache key ${key}: ${error.message}`);
      throw error;
    }
  }
}
