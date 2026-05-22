 import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './core/filter/HttpException.filter';
// import { IoAdapter } from '@nestjs/platform-socket.io';
import { TransformInterceptor } from './core/filter/TransformInterceptor.filter';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from './common/pipe/validate.pipe';
import { XMLMiddleware } from './common/middleware/xml.middleware';
import { ConfigService } from '@nestjs/config';
import rateLimit from 'express-rate-limit';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
let server:any;
async function bootstrap() {
  const logger: Logger = new Logger('main.ts');
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true
  });

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 1000,
    }),
  );

  logger.log('当前服务运行环境：' + process.env.NODE_ENV);

  const config = app.get(ConfigService);

  const prefix = config.get<string>('admin.prefix') || 'basic-api';
  
  // ---------------- 修复这里 ----------------
  const port = process.env.PORT || config.get<number>('admin.port') || 9000;

//   app.useWebSocketAdapter(new IoAdapter(app));
  app.use(new XMLMiddleware().use);
  app.useGlobalPipes(new ValidationPipe());

  app.setGlobalPrefix(prefix + '/', {
    exclude: ['socket.io/*', 'socket.io', '/chat', '/chat/'],
  });

  app.useGlobalFilters(new HttpExceptionFilter(new Logger()));
  app.useGlobalInterceptors(new TransformInterceptor());

  app.useStaticAssets(join(__dirname, '..', config.get<string>('admin.file.location')), {
    prefix: config.get<string>('admin.file.serveRoot'),
  });

  const swagger = new DocumentBuilder()
    .setTitle('jxxqz后台管理系统文档')
    .setDescription('jxxqz后台管理系统接口文档')
    .addBearerAuth()
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, swagger);
  SwaggerModule.setup(`${prefix}/docs`, app, document, {
    swaggerOptions: { persisAuthorization: true },
    customSiteTitle: 'nest-api API Docs',
  });

  // ---------------- 强制监听 0.0.0.0 ----------------
//   await app.listen(port, '0.0.0.0');
 // 把 server 赋值
  server = app.getHttpServer();
//   console.log(`✅ 服务启动成功：${await app.getUrl()}`);
}
bootstrap();  
export default server;

//   Inspect     https://vercel.com/test-client-app/nest-api-client-pre/2YK56eHMe5g
// xZeRr234GjV3xEqim
// ▲ Production  https://nest-api-client-2ga27v4me-test-client-app.vercel.app
// ▲ Aliased     https://nest-api-client-pre.vercel.app
