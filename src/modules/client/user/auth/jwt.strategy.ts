import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { clientJwtContants } from 'src/modules/common/collections-permission/constants/jwtContants';
import { UserService } from '../service/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService:UserService) {
    super({
      // 获取请求header token值 注意header request中拼接Bearer否则401报错未鉴权
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: clientJwtContants.secret,
    });
  }
}
