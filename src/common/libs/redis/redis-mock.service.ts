import { Injectable } from '@nestjs/common';

@Injectable()
export class RedisService {
  private cache: Map<string, { value: string; expireAt?: number }> = new Map();

  async get(key: string): Promise<string | null> {
    const item = this.cache.get(key);
    if (!item) return null;
    if (item.expireAt && Date.now() > item.expireAt) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: string, expireSeconds?: number): Promise<void> {
    const item: { value: string; expireAt?: number } = { value };
    if (expireSeconds) {
      item.expireAt = Date.now() + expireSeconds * 1000;
    }
    this.cache.set(key, item);
  }

  async setex(key: string, seconds: number, value: string): Promise<void> {
    await this.set(key, value, seconds);
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async ttl(key: string): Promise<number> {
    const item = this.cache.get(key);
    if (!item || !item.expireAt) return -2;
    const remaining = Math.ceil((item.expireAt - Date.now()) / 1000);
    return remaining > 0 ? remaining : -2;
  }

  async exists(key: string): Promise<boolean> {
    return this.cache.has(key);
  }
}