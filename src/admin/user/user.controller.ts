import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { UserService } from './user.service';

/***
 * author：zhao.jian
 * createTime：2022年12月22日14:27:17
 * description：用户业务控制器模块
 */
@ApiTags('用户管理')
@Controller('user')
export class UserController {
  constructor(private readonly UserService: UserService) {}

  // @Post('/login')
  // login(@Body() data: loginParamDto) {
  //   console.log('请求登录接口begin');
  //   console.log(data);
  //   return this.UserService.login(data);
  //   console.log('请求登录接口end');
  //   // return this.helloService.postHello(data);
  // }

  @ApiOperation({ summary: '获取用户信息' })
  @ApiBearerAuth() // swagger文档设置token
  @UseGuards(AuthGuard('jwt'))
  @Get()
  getUserInfo(@Req() req) {
    return req.user;
  }
}
