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
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthController } from './controller/auth.controller';
import { ModuleController } from './controller/module.controller';
import { AuthService } from './service/auth.service';
import { LocalStorage } from './auth/local.strategy';
import { JwtStrategy } from './auth/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { jwtContants } from 'src/modules/common/collections-permission/constants/jwtContants';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
    /**jwt鉴权 key和过期时间 */
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: jwtContants.secret,
      signOptions: { expiresIn: jwtContants.expiresIn }, // d天后过期 s秒后过期
    }),
  ],
  controllers: [
    AuthController, // 登录jwt鉴权控制器
    UserController,
    RoleController,
    PositionController,
    DeptController,
    RoleModuleController,
    ModuleController,
  ],
  providers: [
    // jwt鉴权登录服务==============begin=============
    AuthService,
    JwtService,
    LocalStorage,
    JwtStrategy,
    // jwt鉴权登录服务===============end==============
    UserService,
    RoleService,
    UserRoleService,
    RoleModuleService,
    PositionService,
    DeptService,
    ModuleService,
  ],
  exports: [JwtModule], // 必须输出jwt模块否则登录会有问题
})
export class SystemModule {}
