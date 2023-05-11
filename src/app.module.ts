import { RedisClientOptions } from '@liaoliaots/nestjs-redis';
import { Module, RequestMethod, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { RedisModule } from './common/libs/redis/redis.module';
import configuration from './config/index';
import { AdminModule } from './modules/admin/admin.module';
@Module({
  imports: [  
    // 动态加载配置文件  
    ConfigModule.forRoot({
      cache: true,   
      load: [configuration],
      isGlobal: true,
    }),

    // 连接数据库
    TypeOrmModule.forRootAsync({ 
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        console.log(config);
        return {
          type: 'mysql',
          autoLoadEntities: true,
          keepConnectionAlive: true,
          ...config.get('db.mysql'),
        } as TypeOrmModuleOptions;
      },
    }),
    RedisModule.fotRootAsync({
        imports:[ConfigModule],
        inject:[ConfigService],
        useFactory:(config:ConfigService)=>{
            return {
                closeClient:true,
                config:config.get<RedisClientOptions>('redis')
            }
        }
    }),
    AdminModule,
  ]
})
export class AppModule {}
