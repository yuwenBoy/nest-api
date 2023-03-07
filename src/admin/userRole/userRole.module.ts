import { Module } from '@nestjs/common';

import { UserRoleController } from './userRole.controller';
import {  UserRoleService } from './userRole.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRole } from '../../entities/t_user_role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserRole])],
  controllers: [UserRoleController],
  providers: [UserRoleService],
  exports:[UserRoleService]
})
export class UserRoleModule {}
