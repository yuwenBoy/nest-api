import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@InjectRedis() private readonly client: Redis) {}

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  /**
   * ✅ 修复：使用独立的 setex 方法，避免参数混淆
   */
  async set(key: string, value: string, expireSeconds?: number): Promise<void> {
    if (expireSeconds) {
      // ✅ 正确：setex 参数是 (key, seconds, value)
      await this.client.setex(key, expireSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  /**
   * ✅ 新增：独立的 setex 方法（更明确）
   */
  async setex(key: string, seconds: number, value: string): Promise<void> {
    await this.client.setex(key, seconds, value);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  /**
   * ✅ 新增：获取过期时间（调试用）
   */
  async ttl(key: string): Promise<number> {
    const result = await this.client.ttl(key);
    // ✅ 核心：parseInt 转换
    const seconds = parseInt(result as any, 10);
    console.log(`🔧 TTL 原始值: ${result}, 转换后: ${seconds}`); // 调试用
    return isNaN(seconds) ? -2 : seconds;
  }

  /**
   * ✅ 新增：检查键是否存在
   */
  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }
}
