import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeptEntity } from 'src/entities/admin/dept.entity';
import { PositionEntity } from 'src/entities/admin/position.entity';
import { ModuleNEST } from 'src/entities/admin/t_module.entity';
import { Role } from 'src/entities/admin/t_role.entity';
import { RoleModule } from 'src/entities/admin/t_role_module.entity';
import { UserEntity } from 'src/entities/admin/t_user.entity';
import { UserRole } from 'src/entities/admin/t_user_role.entity';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
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
      UserRole,
      Role,
      RoleModule,
      ModuleNEST,
      PositionEntity,
      DeptEntity,
    ]),
  ],
  controllers: [
    // AuthController,
    UserController,
    RoleController,
    UserRoleController,
    RoleController,
    PositionController,
    DeptController,
    RoleModuleController,
  ],
  providers: [
    // JwtService,
    // AuthService,
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
