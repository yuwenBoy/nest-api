import {RedisModule as liaoliaoRedisModule, RedisModuleAsyncOptions } from "@liaoliaots/nestjs-redis";
import { DynamicModule, Module } from "@nestjs/common";
import { RedisService } from "./redis.service";

@Module({
    providers:[],
    exports:[]
})

export class RedisModule {
    static forRoot(options:RedisModuleAsyncOptions,isGlobal = true):DynamicModule {
        return {
            module:RedisModule,
            imports:[liaoliaoRedisModule.forRootAsync(options,isGlobal)],
            providers:[RedisService],
            exports:[RedisService]
        }
    }

    static fotRootAsync(options:RedisModuleAsyncOptions,isGlobal = true):DynamicModule {
        return {
            module: RedisModule,
            imports: [liaoliaoRedisModule.forRootAsync(options, isGlobal)],
            providers: [RedisService],
            exports: [RedisService]
        }
    }
}