// auth.module.ts
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../entities/t_user.entity'
import { LocalStorage } from './local.storage';
import { JwtStrategy} from './jwt.strategy';
import {  AuthController } from '../../app.controller';
import { AuthService } from './auth.service';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), PassportModule,JwtModule], // 导入用户实体、身份验证、jwt
  exports:[JwtModule], // 输出jwt
  controllers: [AuthController],
  providers: [AuthService, LocalStorage,JwtStrategy]
})
export class AuthModule {}
