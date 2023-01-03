import {
  ClassSerializerInterceptor,
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  UseInterceptors,
  Request,
} from '@nestjs/common';
//
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './admin/auth/auth.service';
import { JwtAuthGuard } from './admin/auth/jwt.auth.guard';
import { LocalAuthGuard } from './admin/auth/local.auth.guard';
import { UserService } from './admin/user/user.service';

@ApiTags('用户身份认证即jwt鉴权')
@Controller('auth')
export class AppController {
  constructor(private readonly authService: AuthService,
    private readonly userService:UserService) {}

  // 1.先进行登录验证，执行local.strategy.ts 文件中的calidate方法
  @UseGuards(LocalAuthGuard)
  // @UseInterceptors(ClassSerializerInterceptor)
  @Post('/login')
  async login(@Request() req) {
    // console.log('接收参数');
    // 4.验证通过以后执行这个函数
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/getUserInfo')
  async getUserInfo(@Request() req) {
    console.log(`通过携带token请求用户信息 用户id为：${req.user.id}`);
    const user = await this.userService.getUserById(req.user.id);
    console.log(user);
    return user
  }
}
