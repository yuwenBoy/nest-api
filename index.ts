 // api/index.ts （Vercel 专用）
import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module'; // 改这里
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from 'src/core/filter/HttpException.filter'; // 改这里
import { TransformInterceptor } from 'src/core/filter/TransformInterceptor.filter'; // 改这里
import { ValidationPipe } from 'src/common/pipe/validate.pipe'; // 改这里
import { XMLMiddleware } from 'src/common/middleware/xml.middleware'; // 改这里
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import rateLimit from 'express-rate-limit';
import { Logger } from '@nestjs/common';

let app: NestExpressApplication;

async function bootstrapServer() {
  if (app) return app;

  app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 1000,
    }),
  );

  const config = app.get(ConfigService);
  const prefix = config.get<string>('admin.prefix') || 'basic-api';

  // app.useWebSocketAdapter(new IoAdapter(app)); // 注释
  app.use(new XMLMiddleware().use);
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix(prefix + '/', {
    exclude: ['socket.io/*', 'socket.io', '/chat', '/chat/'],
  });
  app.useGlobalFilters(new HttpExceptionFilter(new Logger()));
  app.useGlobalInterceptors(new TransformInterceptor());

  app.useStaticAssets(join(__dirname, '../../', config.get<string>('admin.file.location')), {
    prefix: config.get<string>('admin.file.serveRoot'),
  });

  await app.init(); // 关键：只初始化，不监听端口
  return app;
}

// Vercel 专用导出
export default async (req: any, res: any) => {
  const app = await bootstrapServer();
  app.getHttpServer().emit('request', req, res);
};