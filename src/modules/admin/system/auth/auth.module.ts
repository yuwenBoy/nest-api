// auth.module.ts
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/entities/admin/t_user.entity';
import { LocalStorage } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from './auth.service';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { UserRoleModule } from '../userRole/userRole.module';
import { RoleModuleModule } from '../roleModule/roleModule.module';
import { ModuleNESTModule } from '../module/module.module';
import { AuthController } from './auth.controller';
import { jwtContants } from 'src/modules/common/collections-permission/constants/jwtContants';
// 导入验证码模块
// import { ToolsService } from 'src/utils/tools/ToolsService';

@Module({
  // 导入用户实体、身份验证、jwt
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: jwtContants.secret,
      signOptions: { expiresIn: jwtContants.expiresIn }, // d天后过期 s秒后过期
    }),RoleModuleModule,UserRoleModule,ModuleNESTModule
  ], 
  exports: [JwtModule], // 输出jwt
  controllers: [AuthController],
  providers: [AuthService, UserService, LocalStorage, JwtStrategy],
})
export class AuthModule {}
