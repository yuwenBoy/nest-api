// common/guard/auth.guard.ts

import {Injectable,CanActivate,HttpException,HttpStatus,ExecutionContext,} from '@nestjs/common';
@Injectable()
export class AuthGuard implements CanActivate {
  // context 请求的(Response/Request)的引用
  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('进入全局权限守卫...');
    // 获取请求对象
    const request = context.switchToHttp().getRequest();
    // 获取请求头中的token字段
    const token = context.switchToRpc().getData().headers.authorization;
    // 如果白名单内的路由就不拦截直接通过
    console.log('14'+request.url)
    if (this.hasUrl(this.urlList, request.url)) {
      return true;
    }
    console.log(token);
    // 验证token的合理性以及根据token做出相应的操作
    if (token) {
      try {
        // 这里可以添加验证逻辑
        return true;
      } catch (e) {
        throw new HttpException(
          '没有授权访问,请先登录',
          HttpStatus.UNAUTHORIZED,
        );
      }
    } else {
      throw new HttpException(
        '没有授权访问,请先登录',
        HttpStatus.UNAUTHORIZED,
      );
    }
  };
  // 白名单数组
  private urlList: string[] = [
    '/basic-api/auth/login',
    '/basic-api/auth/authcode'
  ];

  // 验证该次请求是否为白名单内的路由
  private hasUrl(urlList: string[], url: string): boolean {
    let flag: boolean = false;
    if (urlList.indexOf(url) >= 0) {
      flag = true;
    }
    console.log(flag)
    return flag;
  }
};
