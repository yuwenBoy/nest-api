// local.strategy.ts
import { PassportStrategy } from '@nestjs/passport';
import { IStrategyOptions, Strategy } from 'passport-local';
import { AuthService } from './auth.service';

import {
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class LocalStorage extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    console.log('登录请求参数');
    const user = await this.authService.validateUser(username, password);
    console.log(user);
    if(user){
      if(user.disabled == 2){
        throw new HttpException('账号被禁用，请联系管理员！',HttpStatus.OK);
      }
    }
    if (!user) {
      throw new HttpException('账号或密码错误！',HttpStatus.OK);
    }
    return user;
  }
}
