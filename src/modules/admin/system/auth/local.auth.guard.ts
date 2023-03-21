import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local'){
    // 验证传入参数
    // handleRequest(err, user, info, context, status) {
    //     console.log("---------------")
    //     const request = context.switchToHttp().getRequest();
    //     console.log(request.body)
    //     const { username, password } = request.body;
    //     if (err || !user) {
    //       if (!username) {
    //         throw new HttpException({ message: '用户名不能为空' }, HttpStatus.OK);
    //       } else if (!password) {
    //         throw new HttpException({ message: '密码不能为空' }, HttpStatus.OK);
    //       } else {
    //         throw new HttpException({ message: '用户名或密码错误' }, HttpStatus.OK);
    //         // throw err || new UnauthorizedException();
    //       }
    //     }
    //     return user;
    //   }
}