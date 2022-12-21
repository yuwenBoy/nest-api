import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const prot = 9000;
  await app.listen(prot, () => {
    Logger.log('th service is starting in http://' + prot);
  });
}
bootstrap();
