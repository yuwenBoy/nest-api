// // src/common/cache.service.ts 
// import { Injectable } from '@nestjs/common';
// import { RedisService } from 'nestjs-redis';

// @Injectable()
// export class CacheService {
//   public client;
//   constructor(private redisService: RedisService) {
//     this.getClient();
//   }
//   async getClient() {
//     this.client = await this.redisService.getClient();
//   }

//   //设置值的办法
//   async set(key: string, value: any, seconds?: number) {
//     value = JSON.stringify(value);
//     if (!this.client) {
//       await this.getClient();
//     }
//     if (!seconds) {
//       await this.client.set(key, value);
//     } else {
//       await this.client.set(key, value, 'EX', seconds);
//     }
//   }

//   //获取值的办法
//   async get(key: string) {
//     if (!this.client) {
//       await this.getClient();
//     }
//     const data = await this.client.get(key);
//     if (!data) return;
//     return JSON.parse(data);
//   }

//   // 依据key删除redis缓存数据
//   async del(key: string): Promise<any> {
//     if (!this.client) {
//       await this.getClient();
//     }
//     await this.client.del(key);
//   }

//   // 清空redis的缓存
//   async flushall(): Promise<any> {
//     if (!this.client) {
//       await this.getClient();
//     }
//     await this.client.flushall();
//   }
// }