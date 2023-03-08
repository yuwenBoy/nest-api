import { Module } from '@nestjs/common';

import { DeptController } from './dept.controller';
import {  DeptService } from './dept.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { DeptEntity} from '../../entities/dept.entity';
import { UserEntity } from 'src/entities/t_user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DeptEntity]),UserEntity],
  controllers: [DeptController],
  providers: [DeptService],
})
export class DeptModule {}
