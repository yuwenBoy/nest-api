import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './controller/user.controller';
import { UserEntity } from 'src/entities/admin/t_user.entity';
import { UserService } from './service/user.service';
import { RedisService } from 'src/common/libs/redis/redis.service';
import { UserProfileEntity } from 'src/entities/client/t_user_profile.entity';
import { UserAddressController } from './controller/address.controller';
import { UserAddressService } from './service/address.service';
import { UserAddressEntity } from 'src/entities/client/user_address.entity';
import { AuthModule } from './auth/auth.module';
@Module({
  imports: [
    AuthModule,
    RouterModule.register([{ path: 'client', module: UserModule }]),
    TypeOrmModule.forFeature([UserEntity, UserProfileEntity, UserAddressEntity]),
  ],
  controllers: [UserController, UserAddressController],
  providers: [UserService, RedisService, UserAddressService],
  exports: [UserService, RedisService, UserAddressService],
})
export class UserModule {}
