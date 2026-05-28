import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
  private useMock = false;
  private cache: Map<string, { value: string; expireAt?: number }> = new Map();

  constructor(@InjectRedis() private readonly client: Redis) {}

  async onModuleInit() {
    try {
      await this.client.ping();
    } catch (error) {
      console.log('⚠️ Redis 连接失败，使用内存缓存作为后备');
      this.useMock = true;
    }
  }

  async get(key: string): Promise<string | null> {
    if (this.useMock) {
      const item = this.cache.get(key);
      if (!item) return null;
      if (item.expireAt && Date.now() > item.expireAt) {
        this.cache.delete(key);
        return null;
      }
      return item.value;
    }
    return this.client.get(key);
  }

  async set(key: string, value: string, expireSeconds?: number): Promise<void> {
    if (this.useMock) {
      const item: { value: string; expireAt?: number } = { value };
      if (expireSeconds) {
        item.expireAt = Date.now() + expireSeconds * 1000;
      }
      this.cache.set(key, item);
      return;
    }
    if (expireSeconds) {
      await this.client.setex(key, expireSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async setex(key: string, seconds: number, value: string): Promise<void> {
    await this.set(key, value, seconds);
  }

  async del(key: string): Promise<void> {
    if (this.useMock) {
      this.cache.delete(key);
      return;
    }
    await this.client.del(key);
  }

  async ttl(key: string): Promise<number> {
    if (this.useMock) {
      const item = this.cache.get(key);
      if (!item || !item.expireAt) return -2;
      const remaining = Math.ceil((item.expireAt - Date.now()) / 1000);
      return remaining > 0 ? remaining : -2;
    }
    const result = await this.client.ttl(key);
    const seconds = parseInt(result as any, 10);
    return isNaN(seconds) ? -2 : seconds;
  }

  async exists(key: string): Promise<boolean> {
    if (this.useMock) {
      return this.cache.has(key);
    }
    const result = await this.client.exists(key);
    return result === 1;
  }
}