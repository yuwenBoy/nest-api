import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './controller/user.controller';
import { UserEntity } from 'src/entities/admin/t_user.entity';
import { UserService } from './service/user.service';
import { RedisService } from 'src/common/libs/redis/redis.service';
import { UserProfileEntity } from 'src/entities/client/t_user_profile.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { clientJwtContants } from 'src/modules/common/collections-permission/constants/jwtContants';
@Module({
  imports: [
    RouterModule.register([{ path: '', module: UserModule }]),
    TypeOrmModule.forFeature([UserEntity, UserProfileEntity]),
    /**jwt鉴权 key和过期时间 */
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: clientJwtContants.secret,
      signOptions: { expiresIn: clientJwtContants.expiresIn }, // d天后过期 s秒后过期
    }),
  ],
  controllers: [UserController],
  providers: [UserService, RedisService],
  exports: [UserService, RedisService],
})
export class UserModule {}
