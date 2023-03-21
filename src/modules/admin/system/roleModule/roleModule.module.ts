import { Module } from '@nestjs/common';

import { RoleModuleController } from './roleModule.controller';
import {  RoleModuleService } from './roleModule.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleModule } from 'src/entities/admin/t_role_module.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RoleModule])],
  controllers: [RoleModuleController],
  providers: [RoleModuleService],
  exports:[RoleModuleService]
})
export class RoleModuleModule {}
