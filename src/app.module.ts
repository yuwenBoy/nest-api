import { Module, RequestMethod,MiddlewareConsumer } from '@nestjs/common';
// npm install --save @nestjs/typeorm typeorm mysql
import { TypeOrmModule } from '@nestjs/typeorm';

// 子模块加载
import { HelloModule } from './hello/hello.module';

// 加载用户模块
import { UserModule } from './admin/user/user.module';

// 加载角色模块
import { RoleModule } from './admin/role/role.module';

// 加载用户角色模块
import { UserRoleModule } from './admin/userRole/userRole.module';

// 角色模块表
import { RoleModuleModule } from './admin/roleModule/roleModule.module'

// 菜单模块
import { ModuleNESTModule } from './admin/module/module.module'

// 组织机构模块
import { DeptModule } from './admin/dept/dept.module';

// 职位模块
import { PositionModule } from './admin/position/position.module';

// 登录认证模块
import { AuthModule } from './admin/auth/auth.module';


// 日志模块
import { OperationLogModule } from './security/operation.module';

import { join } from 'path';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { AppController } from './app.controller';
import { ChannelSubscriber } from './core/security/subscirber';
// import { RedisModule } from 'nestjs-redis';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';

// import { RedisModule } from 'nestjs-redis';

// http://www.javashuo.com/article/p-trkdmpss-wu.html  日志系统

@Module({
  imports: [
    // 加载连接数据库 如果连接失败，npm uninstall mysql 安装npm i mysql2
    TypeOrmModule.forRoot({
      type: 'mysql', // 数据库类型
      host: '127.0.0.1',
      port: 3306, // 端口
      username: 'root',
      password: '123456',
      database: 'zj_db_system',
      entities: [join(__dirname, './entities', '**/**.entity{.ts,.js}')],// 扫描本项目中.entity.ts 或者.entity.js的文件
      synchronize: false, // 定义数据库表结构与实体类字段同步（这里一旦数据库少了字段就会自动加入，根据需要来使用）
      dateStrings:true, // ‘2023-03-10T08:27:22.000Z’转换为 ‘2023-03-10 8:27:22’
      logging:false, // 关闭日志
      subscribers:[ChannelSubscriber,join(__dirname, './core/security', '**/**{.ts,.js}')]
    }),
    // RedisModule.forRootAsync({
    //   imports:[ConfigModule],
    //   useFactory: (configService: ConfigService) => {
    //     return { url:configService.get('redis') }
    //   },       
    //   inject:[ConfigService]
    // }),
    // RedisModule.register({
    //   port: '123',
    //   host:'127.0.0.1',
    //   password:'',
    //   db:0
    // }),
    // 加载子模块
    HelloModule,
    UserModule, // 用户模块
    RoleModule, // 角色模块
    UserRoleModule, // 用户角色模块
    RoleModuleModule,
    AuthModule, // 注册权限模块
    ModuleNESTModule, // 注册菜单模块
    DeptModule, // 组织机构模块
    PositionModule, // 职位模块
    OperationLogModule, // 日志模块
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer:MiddlewareConsumer){
    consumer.apply(LoggerMiddleware) // 应用中间件
    .exclude({path:'/basic-api/auth',method:RequestMethod.POST}) // 排除auth的post方法
    .forRoutes(AppController); // 监听路由 参数：路径名或*，*是匹配所有的路由
  }
}
