// // auth.module.ts
// import { PassportModule } from '@nestjs/passport';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { UserEntity } from 'src/entities/admin/t_user.entity';
// import { LocalStorage } from './local.strategy';
// import { JwtStrategy } from './jwt.strategy';
// import { Module } from '@nestjs/common';
// import { JwtModule } from '@nestjs/jwt';
// import { jwtContants } from 'src/modules/common/collections-permission/constants/jwtContants';
// import { SystemModule } from '../system.module';
// import { AuthController } from './auth.controller';
// import { UserService } from '../service/user.service';
// import { AuthService } from './auth.service';
// import { UserRoleService } from '../service/userRole.service';
// import { RoleModuleService } from '../service/roleModule.service';
// import { ModuleService } from '../service/module.service';
// import { UserRoleEntity } from 'src/entities/admin/t_user_role.entity';
// import { RoleModuleEntity } from 'src/entities/admin/t_role_module.entity';
// import { ModuleEntity } from 'src/entities/admin/t_module.entity';
// import { ModuleController } from '../controller/module.controller';
// // 导入验证码模块
// // import { ToolsService } from 'src/utils/tools/ToolsService';

// @Module({
//   // 导入用户实体、身份验证、jwt
//   imports: [
//     TypeOrmModule.forFeature([UserEntity,
//         UserRoleEntity,
//         RoleModuleEntity,
//         ModuleEntity]),
//     PassportModule.register({ defaultStrategy: 'jwt' }),
//     JwtModule.register({
//       secret: jwtContants.secret,
//       signOptions: { expiresIn: jwtContants.expiresIn }, // d天后过期 s秒后过期
//     })
//   ], 
//   exports: [], // 输出jwt JwtModule
//   controllers: [], // AuthController
//   providers: [],
// })
// export class AuthModule {}









/*************************************说明：此文件是登录相关逻辑导出，目前移至文件内容到system.module.ts处
 * 
 * 
 */
