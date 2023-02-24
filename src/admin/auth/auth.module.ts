// auth.module.ts
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../entities/t_user.entity';
import { LocalStorage } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { AppController } from '../../app.controller';
import { AuthService } from './auth.service';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { jwtContants } from './jwt.contants';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: jwtContants.secret,
      signOptions: { expiresIn: '180s' }, // d天后过期 s秒后过期
    }),
  ], // 导入用户实体、身份验证、jwt
  exports: [JwtModule], // 输出jwt
  controllers: [AppController],
  providers: [AuthService, UserService, LocalStorage, JwtStrategy],
})
export class AuthModule {}
