import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeptEntity } from 'src/entities/admin/dept.entity';
import { PositionEntity } from 'src/entities/admin/position.entity';
import { ModuleEntity } from 'src/entities/admin/t_module.entity';
import { RoleEntity } from 'src/entities/admin/t_role.entity';
import { RoleModuleEntity } from 'src/entities/admin/t_role_module.entity';
import { UserEntity } from 'src/entities/admin/t_user.entity';
import { UserRoleEntity } from 'src/entities/admin/t_user_role.entity';
import { DeptController } from './dept/dept.controller';
import { DeptService } from './dept/dept.service';
import { ModuleService } from './module/module.service';
import { PositionController } from './position/position.controller';
import { PositionService } from './position/position.service';
import { RoleController } from './role/role.controller';
import { RoleService } from './role/role.service';
import { RoleModuleController } from './roleModule/roleModule.controller';
import { RoleModuleService } from './roleModule/roleModule.service';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { UserRoleController } from './userRole/userRole.controller';
import { UserRoleService } from './userRole/userRole.service';
@Module({
  imports: [
    RouterModule.register([{ path: '', module: SystemModule }]),
    TypeOrmModule.forFeature([
      UserEntity,
      UserRoleEntity,
      RoleEntity,
      RoleModuleEntity,
      ModuleEntity,
      PositionEntity,
      DeptEntity,
    ]),
  ],
  controllers: [
    UserController,
    RoleController,
    UserRoleController,
    RoleController,
    PositionController,
    DeptController,
    RoleModuleController,
  ],
  providers: [
    UserService,
    RoleService,
    UserRoleService,
    RoleModuleService,
    PositionService,
    DeptService,
    ModuleService,
  ],
})
export class SystemModule {}
