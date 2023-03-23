import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './core/filter/HttpException.filter';

import { TransformInterceptor } from './core/filter/TransformInterceptor.filter';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AuthGuard } from './common/guard/auth.guard';
import { ValidationPipe } from './common/pipe/validate.pipe';
import { XMLMiddleware } from './common/middleware/xml.middleware';
import adminConfig from './config/admin.config';

async function bootstrap() {
  // const logger:Logger = new Logger('main.ts');
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'debug', 'error', 'warn'],
    cors: true,
  });

  const prefix = adminConfig.Prefix;
  const prot = adminConfig.PROT;

  // 全局注册xml支持中间件（这里必须调用.use才能够注册）
  app.use(new XMLMiddleware().use);

  // app.useLogger()

  // 全局使用管道:这里使用的是内置，也可以使用自定义管道，在下文
  app.useGlobalPipes(new ValidationPipe());

  // 全局路由前缀
  app.setGlobalPrefix('/' + prefix + '/');

  // 全局注册通用异常过滤器httpExceptionFilter
  app.useGlobalFilters(new HttpExceptionFilter(new Logger()));

  // 全局注册权限验证守卫
  app.useGlobalGuards(new AuthGuard());

  // 全局使用拦截器
  app.useGlobalInterceptors(new TransformInterceptor());

  // 设置swagger文档
  const config = new DocumentBuilder()
    .setTitle('jxxqz后台管理系统文档')
    .setDescription('jxxqz后台管理系统接口文档')
    .addBearerAuth()
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`docs/${prefix}`, app, document);

  await app.listen(prot, () => {
    Logger.log(`服务已经启动,接口请访3333问http://localhost:${prefix}/${prot}`);
    Logger.log(`服务已经启动,接口接口请444444访问http://localhost:${prot}/docs/${prefix}`)
  });
}
bootstrap();
