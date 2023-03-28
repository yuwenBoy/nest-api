import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtContants } from 'src/modules/common/collections-permission/constants/jwtContants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // 获取请求header token值 注意header request中拼接Bearer否则401报错未鉴权
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration:false,
      secretOrKey: jwtContants.secret,
    })
  }  
  async validate(payload: any) {
    console.log('jwt认证通成功...');
    //payload：jwt-passport认证jwt通过后解码的结果
    return { username: payload.username, id: payload.id };
  }
}
