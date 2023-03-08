import { Module } from '@nestjs/common';

import { PositionController } from './position.controller';
import {  PositionService } from './position.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { PositionEntity } from '../../entities/position.entity';
import { UserEntity } from 'src/entities/t_user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PositionEntity]),UserEntity],
  controllers: [PositionController],
  providers: [PositionService],
})
export class PositionModule {}
