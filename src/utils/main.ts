import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { HttpExceptionFilter } from '../core/filter/HttpException.filter';

import { TransformInterceptor } from '../core/filter/TransformInterceptor.filter';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AuthGuard } from '../modules/common/auth/auth.guard';
import { ValidationPipe } from '../common/pipe/validate.pipe';
import { XMLMiddleware } from '../common/middleware/xml.middleware';
import { ConfigService } from '@nestjs/config';
import rateLimit from 'express-rate-limit';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { WsAdapter } from '../modules/chat/ws.adapter';
/**
 * 程序入口文件main.ts
 */
async function bootstrap() {
  const logger: Logger = new Logger('main.ts');
  const app = await NestFactory.create<NestExpressApplication>(AppModule,{
    cors:true
  });

  // 设置访问频率
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15分钟
      max: 1000, // 限制15分钟内最多只能访问1000次
    }),
  );

  logger.log('当前服务运行环境：' + process.env.NODE_ENV);

  let config = app.get(ConfigService);

  const prefix = config.get<string>('admin.prefix') || 8080;
  const port = config.get<string>('admin.port') || 8080;

  // 全局注册xml支持中间件（这里必须调用.use才能够注册）
  app.use(new XMLMiddleware().use);

  // app.useLogger()

  // 全局使用管道:这里使用的是内置，也可以使用自定义管道，在下文
  app.useGlobalPipes(new ValidationPipe());

  // 全局路由前缀
  app.setGlobalPrefix(prefix + '/');

  // 全局注册通用异常过滤器httpExceptionFilter
  app.useGlobalFilters(new HttpExceptionFilter(new Logger()));

  // 全局注册权限验证守卫
//   app.useGlobalGuards(new AuthGuard(config));

  // 全局使用拦截器
  app.useGlobalInterceptors(new TransformInterceptor());

  // 配置静态资源文件访问
  app.useStaticAssets(join(__dirname, '..', config.get<string>('admin.file.location')), {
    prefix: config.get<string>('admin.file.serveRoot'), //设置虚拟路径
  });

  app.useWebSocketAdapter(new WsAdapter(app));

  // 设置swagger文档
  const swagger = new DocumentBuilder()
    .setTitle('jxxqz后台管理系统文档')
    .setDescription('jxxqz后台管理系统接口文档')
    .addBearerAuth()
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swagger);
  SwaggerModule.setup(`${prefix}/docs`, app, document, {
    swaggerOptions: {
      persisAuthorization: true,
    },
    customSiteTitle: 'nest-api API Docs',
  });

  await app.listen(port, () => {
    Logger.log(`服务已经启动,接口请访问http://localhost:${port}${prefix}`);
    Logger.log(
      `服务已经启动,接口接口请访问http://localhost:${port}${prefix}/docs`,
    );
  });
}
bootstrap();
