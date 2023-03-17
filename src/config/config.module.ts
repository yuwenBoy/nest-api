import { Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import { join } from 'path'

@Module({
  providers: [
    {
      provide: ConfigService,
      useValue: new ConfigService(join(process.cwd(),`src/dev.env`)),
    },
  ],
  exports: [ConfigService],
})
export class ConfigModule {}