import { Module } from '@nestjs/common';

import { HelloController } from './hello.controller';
import { HelloService } from './hello.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity} from '../entities/articles.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [HelloController],
  providers: [HelloService],
})
export class HelloModule {}
