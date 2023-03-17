import { Module } from '@nestjs/common';

import { UserController } from './user.controller';
import {  UserService } from './user.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity} from '../../entities/t_user.entity';
import { DeptEntity } from 'src/entities/dept.entity';
import { PositionEntity } from 'src/entities/position.entity';
import { UserRoleModule } from '../userRole/userRole.module';
import { OperationLogModule } from 'src/security/operation.module';


@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]),DeptEntity,PositionEntity,UserRoleModule,OperationLogModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
