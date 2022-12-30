import { Logger, ParseArrayPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './core/filter/HttpException.filter';

import { TransformInterceptor  } from './core/filter/TransformInterceptor.filter';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  const prot = 9000;

  // 全局使用管道:这里使用的是内置，也可以使用自定义管道，在下文
  // app.useGlobalPipes(new ParseArrayPipe());

  // app.use(LoggerMiddleware);

  // 全局路由前缀
  app.setGlobalPrefix('/basic-api/'); 

  // 全局使用过滤器
  app.useGlobalFilters(new HttpExceptionFilter());

  // 全局使用守卫
  // app.useGlobalGuards(new AuthGuard());

  // 全局使用拦截器
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
    
    Logger.log(`服务已经启动 http://localhost:${prot}`)
  });
}
bootstrap();
