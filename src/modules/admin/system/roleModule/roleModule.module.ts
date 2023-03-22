import { Module } from '@nestjs/common';

import { RoleModuleController } from './roleModule.controller';
import {  RoleModuleService } from './roleModule.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleModuleEntity } from 'src/entities/admin/t_role_module.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RoleModuleEntity])],
  controllers: [RoleModuleController],
  providers: [RoleModuleService],
  exports:[RoleModuleService]
})
export class RoleModuleModule {}
