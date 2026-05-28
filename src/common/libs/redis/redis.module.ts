import { RedisModule as liaoliaoRedisModule, RedisModuleAsyncOptions } from "@liaoliaots/nestjs-redis";
import { DynamicModule, Module } from "@nestjs/common";
import { RedisService } from "./redis.service";

@Module({
    providers:[RedisService],
    exports:[RedisService]
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
            imports: [liaoliaoRedisModule.forRootAsync({
                ...options,
                useFactory: async (...args: any[]) => {
                    const config = await options.useFactory(...args);
                    if (!config || !config.config) {
                        console.log('⚠️ Redis 配置不存在，使用内存缓存作为后备');
                        return {
                            closeClient: true,
                            config: {
                                host: 'localhost',
                                port: 6379,
                            }
                        };
                    }
                    return config;
                }
            }, isGlobal)],
            providers: [RedisService],
            exports: [RedisService]
        }
    }
}