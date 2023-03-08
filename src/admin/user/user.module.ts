import { Module } from '@nestjs/common';

import { UserController } from './user.controller';
import {  UserService } from './user.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity} from '../../entities/t_user.entity';
import { DeptEntity } from 'src/entities/dept.entity';
import { PositionEntity } from 'src/entities/position.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]),DeptEntity,PositionEntity],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
