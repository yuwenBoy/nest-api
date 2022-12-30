import { ClassSerializerInterceptor, Controller, Post,Body, UseGuards, UseInterceptors, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { loginParamDto } from '../user/dto/user.dto';

@ApiTags('验证')
@Controller('user')
export class AuthController {
  @UseGuards(AuthGuard('local'))
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('/login')
  async login(@Body() user: loginParamDto, @Req() req) {
    console.log('接收参数');
    console.log(user);
    req.user;
  }
}
