import {
  Controller,
  Post,
  Get,
  UseGuards,
  Request,
  Body,
  HttpCode,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserService } from '../service/user.service';
import { LoginDto } from '../dto/login.dto';

@ApiTags('客户端用户模块')
@Controller('client/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 发送验证码
  @Post('sendCode')
 @HttpCode(200)
  async sendCode(@Body() body: { phone: string }) {
    const code = await this.userService.sendSmsCode(body.phone);
    // ✅ 开发环境返回验证码
    if (process.env.NODE_ENV !== 'production') {
      console.log(`验证码: ${code}`);
      return {
        code: 200,
        msg: '验证码发送成功',
        data: { code }, // ✅ 返回对象，前端能接收到
      };
    }
    return {
      code: 200,
      msg: '验证码发送成功',
      data: {},
    };
  }

  /**
   * 手机号+验证码登录（自动注册）
   */
  @Post('login')
  @HttpCode(200)
  async login(@Body() body: LoginDto) {
    const { phone, code } = body;

    // ✅ 1. 验证验证码
    await this.userService.validateCode(phone, code);

    // ✅ 2. 查询或创建用户
    const { user, isNew } = await this.userService.findOrCreate(phone);

    // 3. ✅ 更新最后登录时间和登录次数（关键！）
    await this.userService.updateLoginStats(user.id);

    // ✅ 4. 生成Token
    const token = await this.userService.generateToken({
      userId: user.id,
      phone: user.phone,
      userType: user.userType,
    });

    console.log(`✅ ${isNew ? '注册' : '登录'}成功: ${phone}`);

    return {
      code: 200,
      msg: isNew ? '注册成功' : '登录成功',
      data: {
       token,
        userInfo: {
          id: user.id,
          phone: user.phone,
          nickname: user.nick_name,
          avatar: user.avatar,
        },
      },
    };
  }
}
