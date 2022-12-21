import { Module } from '@nestjs/common';
// npm install --save @nestjs/typeorm typeorm mysql
import { TypeOrmModule } from '@nestjs/typeorm';

// 子模块加载
import { HelloModule } from './hello/hello.module';

@Module({
  imports: [
  // 加载连接数据库
  TypeOrmModule.forRoot({
    type: 'mysql', // 数据库类型
    host:'127.0.0.1',
    port: 3306, // 端口
    username:'root',
    password:'123456',
    database:'nodetest',
    entities:[__dirname + '/**/*.entity(.ts,js)'], // 扫描本项目中.entity.ts 或者.entity.js的文件
    synchronize:true, // 定义数据库表结构与实体类字段同步（这里一旦数据库少了字段就会自动加入，根据需要来使用）
  }),
  // 加载子模块
  HelloModule,
],
  controllers: [],
  providers: [],
})
export class AppModule {}
