import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './core/filter/HttpException.filter';

import { TransformInterceptor  } from './core/filter/TransformInterceptor.filter';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const prot = 9000;
  app.setGlobalPrefix('/basic-api/'); // 全局路由前缀

  // 注册全局错误的过滤器
  app.useGlobalFilters(new HttpExceptionFilter());

  // 全局注册成功拦截器
  app.useGlobalInterceptors(new TransformInterceptor());

  // 设置swagger文档
  const config = new DocumentBuilder()
    .setTitle('管理后台')   
    .setDescription('管理后台接口文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(prot, () => {
    Logger.log('th service is starting in http://' + prot);
  });
}
bootstrap();
