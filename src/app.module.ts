import { Module, RequestMethod, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
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
    AdminModule,
  ],
  providers: [
    // {provide:APP_INTERCEPTOR,useClass:LoggingInterceptor}
  ],
})
export class AppModule {}
