import { Injectable, Logger } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';

@Injectable()
export class ExternalCacheService {
  private readonly logger = new Logger(ExternalCacheService.name);

  constructor(@InjectRedis() private readonly redis: Redis) { }

  async keys(pattern: string): Promise<string[]> {
    try {
      return await this.redis.keys(pattern);
    } catch (error) {
      this.logger.error(
        `Failed to get keys with pattern "${pattern}": ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    try {
      const data = JSON.stringify(value);
      if (ttlSeconds) {
        await this.redis.set(key, data, 'EX', ttlSeconds);
      } else {
        await this.redis.set(key, data);
      }
      this.logger.debug(`Cached key "${key}" with TTL ${ttlSeconds ?? 'none'}`);
    } catch (error) {
      this.logger.error(
        `Failed to cache key "${key}": ${error.message}`,
        error.stack,
      );
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
        `Failed to get key "${key}" from cache: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getKeysByPattern(
    pattern: string,
    limit = 1000,
    count = 100,
  ): Promise<string[]> {
    const keys: string[] = [];
    let cursor = '0';

    try {
      do {
        const [nextCursor, foundKeys] = await this.redis.scan(
          cursor,
          'MATCH',
          pattern,
          'COUNT',
          count,
        );
        cursor = nextCursor;
        keys.push(...foundKeys);

        if (keys.length >= limit) {
          break;
        }
      } while (cursor !== '0');
    } catch (error) {
      this.logger.error(
        `Failed to scan keys with pattern "${pattern}": ${error.message}`,
        error.stack,
      );
      throw error;
    }

    return keys.slice(0, limit);
  }

  async getManyByPattern<T>(pattern: string, limit = 1000): Promise<Array<T>> {
    try {
      const keys = await this.getKeysByPattern(pattern, limit);
      if (keys.length === 0) return [];

      const pipeline = this.redis.pipeline();
      keys.forEach((key) => pipeline.get(key));
      const results = await pipeline.exec();

      if (!results) return [];

      const parsedValues: Array<T> = [];
      for (const [err, value] of results) {
        if (err) {
          this.logger.error(
            `Error fetching key in pipeline: ${err.message}`,
            err.stack,
          );
          continue;
        }
        if (value) {
          try {
            parsedValues.push(JSON.parse(value as string) as T);
          } catch (parseError) {
            this.logger.error(
              `Failed to parse JSON for a key: ${parseError.message}`,
              parseError.stack,
            );
          }
        }
      }
      return parsedValues;
    } catch (error) {
      this.logger.error(
        `Failed to get by pattern "${pattern}" from cache: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async del(...keys: string[]): Promise<void> {
    if (keys.length === 0) return;
    try {
      await this.redis.del(...keys);
      this.logger.debug(`Deleted cache keys: ${keys.join(', ')}`);
    } catch (error) {
      this.logger.error(
        `Failed to delete cache keys ${keys.join(', ')}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async hset(
    key: string,
    fieldValues: Record<string, string | Buffer | number>,
  ): Promise<number> {
    try {
      const flatFieldValues = Object.entries(fieldValues).flat();
      return await this.redis.hset(key, ...flatFieldValues);
    } catch (error) {
      this.logger.error(
        `Failed to set hash fields for key "${key}": ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async hdel(key: string, ...fields: string[]): Promise<number> {
    try {
      return await this.redis.hdel(key, ...fields);
    } catch (error) {
      this.logger.error(
        `Failed to delete fields ${fields.join(', ')} from hash "${key}": ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async hexists(key: string, field: string): Promise<boolean> {
    try {
      const exists = await this.redis.hexists(key, field);
      return exists === 1;
    } catch (error) {
      this.logger.error(
        `Failed to check existence of field "${field}" in hash "${key}": ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async hlen(key: string): Promise<number> {
    try {
      const count = await this.redis.hlen(key);
      return count;
    } catch (error) {
      this.logger.error(
        `Failed to get hash length for key "${key}": ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    try {
      const data = await this.redis.hgetall(key);
      return data;
    } catch (error) {
      this.logger.error(
        `Failed to get all hash fields for key "${key}": ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async hincrby(
    key: string,
    field: string,
    increment: number,
  ): Promise<number> {
    try {
      return await this.redis.hincrby(key, field, increment);
    } catch (error) {
      this.logger.error(
        `Failed to increment field "${field}" by ${increment} in hash "${key}": ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
