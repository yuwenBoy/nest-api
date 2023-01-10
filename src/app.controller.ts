import {
  Controller,
  Post,
  Get,
  UseGuards,
  Request,
  ClassSerializerInterceptor,
  UseInterceptors,
} from '@nestjs/common';
//
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './admin/auth/auth.service';
import { JwtAuthGuard } from './admin/auth/jwt.auth.guard';
import { LocalAuthGuard } from './admin/auth/local.auth.guard';
import { UserService } from './admin/user/user.service';
import { Public } from './common/decorator/public.decorator';

@ApiTags('用户身份认证即jwt鉴权')
@Controller('auth')
export class AppController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Public()
  // 1.先进行登录验证，执行local.strategy.ts 文件中的calidate方法
  @UseGuards(LocalAuthGuard)
  // @UseInterceptors(ClassSerializerInterceptor)
  @Post('/login')
  async login(@Request() req) {
    // console.log('接收参数');
    console.log('接受参数' + req);
    // 4.验证通过以后执行这个函数
    return this.authService.login(req.user);
  }

  /**
   * 获取登录用户信息
   * @param req token
   * @returns userInfo
   */
  @ApiOperation({ summary: '获取用户信息' })
  @ApiBearerAuth() // swagger文档设置token
  @UseGuards(JwtAuthGuard)
  @Get('/getUserInfo')
  async getUserInfo(@Request() req) {
    console.log(`通过携带token请求用户信息 用户id为：${req.user.id}`);
    const user = await this.userService.getUserById(req.user.id);
    const result = {
      homePath: '/dashboard/analysis', // 自定义首页跳转路径
      ...user,
    };
    return result;
  }
}
