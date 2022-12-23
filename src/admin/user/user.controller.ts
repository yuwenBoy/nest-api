import { Controller, Get, Post, Body } from '@nestjs/common';
import { UserEntity } from '../../entities/t_user.entity';

import { loginParamDto } from './dto/user.dto';
import { UserService } from './user.service';

/***
 * author：zhao.jian
 * createTime：2022年12月22日14:27:17
 * description：用户业务控制器模块
 */
@Controller('/basic-api/user')
export class UserController {
  constructor(private readonly UserService: UserService) {}

  @Post('/login')
  login(@Body() data: loginParamDto) {
    console.log('请求登录接口begin');
    console.log(data);
    return this.UserService.login(data);
    console.log('请求登录接口end');
    // return this.helloService.postHello(data);
  }
}
