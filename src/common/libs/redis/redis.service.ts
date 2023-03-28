import { InjectRedis } from "@liaoliaots/nestjs-redis";
import { Injectable } from "@nestjs/common";
import Redis from "ioredis";

@Injectable()
export class RedisService {
     constructor(@InjectRedis() private readonly client:Redis){}

     getClient():Redis {
        return this.client;
     }

     async set(key:string,val:string,seconds?:number):Promise<any>{
        if(!seconds) return await this.client.set(key,val);
        return await this.client.set(key,val,'EX',seconds);
     }

      /**
   * 返回对应 value
   * @param key
   */
  async get(key: string): Promise<string> {
    if (!key || key === '*') return null
    return await this.client.get(key)
  }

  async del(keys: string | string[]): Promise<number> {
    if (!keys || keys === '*') return 0
    if (typeof keys === 'string') keys = [keys]
    return await this.client.del(...keys)
  }
}