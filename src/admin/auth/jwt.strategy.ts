import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { jwtContants } from './jwt.contants';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../user/user.service';
// import 

// import { ConfigService } from '@nestjs/config';
// import { StrategyOptions, Strategy, ExtractJwt } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // 获取请求header token值
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration:false,
      secretOrKey: jwtContants.secret,
      userService: UserService,
    });
  }  
  async validate(payload: any) {
    console.log('payload', payload);
    console.log('jwt认证通成功...');
    //payload：jwt-passport认证jwt通过后解码的结果
    return { username: payload.username, id: payload.id };
  }
}
