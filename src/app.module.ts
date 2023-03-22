import { Module, RequestMethod,MiddlewareConsumer } from '@nestjs/common';
// npm install --save @nestjs/typeorm typeorm mysql
import { TypeOrmModule } from '@nestjs/typeorm';

import * as path from 'path';
import { AdminModule } from './modules/admin/admin.module';
import { ConfigModule, ConfigService } from 'nestjs-config';

@Module({ 
  imports: [
     // 配置加载配置文件
     ConfigModule.load(path.resolve(__dirname, 'config', '**/!(*.d).{ts,js}'), {
      modifyConfigName: (name: string) => name.replace('.config', ''),
    }), 

    // 加载连接数据库 如果连接失败，npm uninstall mysql 安装npm i mysql2
     // mysql的连接
     TypeOrmModule.forRootAsync({
      useFactory: async (config: ConfigService) => ({
        type: config.get('database.type'),
        host: config.get('database.host'),
        port: config.get('database.port'),
        username: config.get('database.username'),
        password: config.get('database.password'),
        database: config.get('database.database'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        logging:true,
        // logging: config.get('database.logging'),
        // synchronize: true, // 同步数据库
        timezone: '+08:00', // 东八区
        cache: {
          duration: 60000, // 1分钟的缓存
        },
        extra: {
          // poolMax: 32,
          // poolMin: 16,
          // queueTimeout: 60000,
          // pollPingInterval: 60, // 每隔60秒连接
          // pollTimeout: 60, // 连接有效60秒
        },
      }),
      inject: [ConfigService],
    }),
    AdminModule
  ],
  controllers: [], 
  providers: [],
})
export class AppModule {
  // configure(consumer:MiddlewareConsumer){
  //   consumer.apply(LoggerMiddleware) // 应用中间件
  //   .exclude({path:'/basic-api/admin/auth',method:RequestMethod.POST}) // 排除auth的post方法
  //   .forRoutes(AuthController); // 监听路由 参数：路径名或*，*是匹配所有的路由
  // }
}
