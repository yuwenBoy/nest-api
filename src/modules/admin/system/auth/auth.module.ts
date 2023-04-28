import { Global, Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModuleEntity } from 'src/entities/admin/t_module.entity';
import { RoleEntity } from 'src/entities/admin/t_role.entity';
import { RoleModuleEntity } from 'src/entities/admin/t_role_module.entity';
import { UserEntity } from 'src/entities/admin/t_user.entity';
import { UserRoleEntity } from 'src/entities/admin/t_user_role.entity';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { jwtContants } from 'src/modules/common/collections-permission/constants/jwtContants';
import { AuthController } from '../controller/auth.controller';
import { AuthService } from '../service/auth.service';
import { LocalStorage } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { UserService } from '../service/user.service';
import { UserRoleService } from '../service/userRole.service';
import { RoleModuleService } from '../service/roleModule.service';
import { ModuleService } from '../service/module.service';
import { ConfigService } from '@nestjs/config';

/****
 * 系统权限验证全局模块
 * 
 */
@Global()
@Module({
  imports: [
    RouterModule.register([{ path: '', module: AuthModule }]),
    TypeOrmModule.forFeature([
        UserEntity,
        UserRoleEntity,
        RoleEntity,
        RoleModuleEntity,
        ModuleEntity,
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
  ],
  providers: [
    // jwt鉴权登录服务==============begin=============
    ConfigService,
    AuthService,
    JwtService,
    LocalStorage,
    JwtStrategy,
    // jwt鉴权登录服务===============end==============
    UserService,
    UserRoleService,
    RoleModuleService,
    ModuleService,
  ],
  exports:[
      ConfigService,
      AuthService,
      JwtService,
      LocalStorage,
      JwtStrategy,
      JwtModule,
  ]
})
export class AuthModule {}
