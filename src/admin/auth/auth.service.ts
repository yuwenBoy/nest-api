//auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from 'src/entities/t_user.entity';
import { Repository } from 'typeorm';

import {UserService} from '../user/user.service';
import { jwtContants } from './jwt.contants';
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  // 2.验证账号密码是否正确，正确返回user 错误返回null
  async validateUser(account: string, pass: string): Promise<any> {
    const user = await this.userService.getUserAccout(account);
    if (user && user.password === '123456') {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  // 生成token
  createToken(user: Partial<UserEntity>) {
    return this.jwtService.sign(user);
  }

  // 验证通过，生成token返回给客户端
  async login(user: Partial<UserEntity>) {
    console.log('登录成功，开始生成token');
    // console.log(user);
    const payload = { username: user.username, id: user.id };
    return {
      token: this.jwtService.sign(payload,jwtContants),
    };
  }
}
