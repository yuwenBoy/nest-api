import { Module } from '@nestjs/common';

import { DeptController } from './dept.controller';
import {  DeptService } from './dept.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { DeptEntity} from '../../entities/dept.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DeptEntity])],
  controllers: [DeptController],
  providers: [DeptService],
})
export class DeptModule {}
