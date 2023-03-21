// import { Controller, Post, Get, UseGuards, Request } from '@nestjs/common';
// import { Req, Res, Session } from '@nestjs/common/decorators';
// import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
// import { AuthService } from './modules/admin/system/auth/auth.service';
// import { JwtAuthGuard } from './modules/admin/system/auth/jwt.auth.guard';
// import { LocalAuthGuard } from './modules/admin/system/auth/local.auth.guard';
// // import { ToolsService } from './utils/tools/ToolsService';

// @ApiTags('用户身份认证即jwt鉴权')
// @Controller('auth')
// export class AppController {
//   constructor(
//     private readonly authService: AuthService,
//   ) {}

//   // 1.先进行登录验证，执行local.strategy.ts 文件中的calidate方法
//   @UseGuards(LocalAuthGuard) // 无需token验证
//   @Post('/login')
//   async login(@Request() req) {
//     // console.log('接收参数');
//     console.log('接受参数' + req);
//     // 4.验证通过以后执行这个函数
//     return this.authService.login(req.user);
//   }

//   // @UseGuards(LocalAuthGuard) // 无需token验证
//   @Get('/authcode')
//   async getCode(@Req() req, @Res() res, @Session() session) {
//     console.log('调试');
//     // const svgCaptcha = await this.toolsService.captche(); // 创建验证码
//     // console.log(svgCaptcha.text);
//     // // session.code = svgCaptcha.text;
//     // // console.log(session.code);
//     // res.type('image/svg+xml'); // 指定返回的类型
//     // res.send(svgCaptcha.data); // 给页面返回一张图片
//   }

//   /**
//    * 系统退出登录
//    * @param req token
//    * @returns null
//    */
//   @ApiOperation({ summary: '系统退出登录' })
//   @Get('/logout')
//   async logout() {
//     return;
//   }

//   /**
//    * 获取登录用户信息
//    * @param req token
//    * @returns userInfo
//    */
//   @ApiOperation({ summary: '获取用户信息' })
//   @ApiBearerAuth() // swagger文档设置token
//   @UseGuards(JwtAuthGuard) // 需要jwt鉴权认证
//   @Get('/getUserInfo')
//   async getUserInfo(@Request() req) {
//     try {
//       console.log(`通过携带token请求用户信息 用户id为：${req.user.id}`);
//       return await this.authService.userInfo(req.user.id);
//     } catch (error) {}
//   }
// }
