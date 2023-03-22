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
import { RoleController } from './controller/role.controller';
import { UserController } from './controller/user.controller';
import { DeptController } from './controller/dept.controller';
import { DeptService } from './service/dept.service';
import { ModuleService } from './service/module.service';
import { PositionController } from './controller/position.controller';
import { PositionService } from './service/position.service';
import { RoleModuleController } from './controller/roleModule.controller';
import { RoleModuleService } from './service/roleModule.service';
import { RoleService } from './service/role.service';
import { UserService } from './service/user.service';
import { UserRoleService } from './service/userRole.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtContants } from 'src/modules/common/collections-permission/constants/jwtContants';
import { AuthController } from './controller/auth.controller';
import { AuthService } from './service/auth.service';
@Module({
  imports: [
    RouterModule.register([{ path: '', module: SystemModule }]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: jwtContants.secret,
      signOptions: { expiresIn: jwtContants.expiresIn }, // d天后过期 s秒后过期
    }),
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
    AuthController,
    UserController,
    RoleController,
    PositionController,
    DeptController,
    RoleModuleController,
  ],
  providers: [
    AuthService,
    UserService,
    RoleService,
    UserRoleService,
    RoleModuleService,
    PositionService,
    DeptService,
    ModuleService,
  ],
  exports: [JwtModule], // 输出jwt
})
export class SystemModule {}
