import { Module } from '@nestjs/common'; // 移除Global装饰器
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config'; // 新增ConfigModule导入
import { clientJwtContants } from 'src/modules/common/collections-permission/constants/jwtContants';
import { JwtStrategy } from './jwt.strategy';

// 鉴权模块只保留核心依赖，业务控制器/服务移到UserModule
import { UserProfileEntity } from 'src/entities/client/t_user_profile.entity';
import { UserEntity } from 'src/entities/admin/t_user.entity';
import { UserService } from '../service/user.service';
import { UserController } from '../controller/user.controller';
import { LocalStorage } from './local.strategy';
import { UserAddressService } from '../service/address.service';
import { RedisService } from 'src/common/libs/redis/redis.service';
import { UserAddressEntity } from 'src/entities/client/user_address.entity';

/**
 * 顾客端权限验证模块（非全局，专注鉴权核心逻辑）
 * 业务相关的Controller/Service移到UserModule中
 */
@Module({
  imports: [
    // 1. 导入ConfigModule，确保ConfigService能正常注入
    ConfigModule,
    // 2. 只导入鉴权必需的实体（移除地址实体）
    TypeOrmModule.forFeature([
      UserProfileEntity,
      UserEntity,
      UserAddressEntity,
    ]),
    // 3. 自定义策略名，避免和后台jwt冲突
    PassportModule.register({ defaultStrategy: 'client-jwt' }),
    JwtModule.register({
      secret: clientJwtContants.secret,
      signOptions: { expiresIn: clientJwtContants.expiresIn }, // d天后过期 s秒后过期
    }),
  ],
  // 5. 移除业务控制器（UserController移到UserModule）
  controllers: [UserController],
  providers: [
    ConfigService,
    UserService,
    JwtService,
    LocalStorage,
    // 6. 只保留鉴权核心依赖，移除业务服务/冗余依赖
    JwtStrategy,
    RedisService,
    UserAddressService,
    // ConfigService由ConfigModule自动注入，无需手动注册
  ],
  exports: [
    ConfigService,
    UserService,
    JwtService,
    LocalStorage,
    JwtStrategy,
    JwtModule,
  ],
})
export class AuthModule {}
