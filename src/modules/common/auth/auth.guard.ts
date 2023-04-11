// common/guard/auth.guard.ts

import {
  Injectable,
  CanActivate,
  HttpException,
  HttpStatus,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getUrlQuery } from 'src/utils/url';
import { AuthService } from 'src/modules/admin/system/service/auth.service';
import { API_AUTH_KEY } from 'src/modules/common/collections-permission/constants/api.auth';
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly config: ConfigService,
    private readonly authService: AuthService,
  ) {}

  private urlList = this.config.get('perm.router.whitelist');

  // context 请求的(Response/Request)的引用
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const logger: Logger = new Logger('auth.guard.ts');
    logger.log('进入全局权限守卫...');
    // 获取请求对象
    const request = context.switchToHttp().getRequest();
    // 获取请求头中的token字段
    const token =
      context.switchToRpc().getData().headers.authorization ||
      context.switchToHttp().getRequest().body.authorization ||
      getUrlQuery(request.url, 'authorization');

    logger.log(`当前的token：${token}`, `AuthGuard`);

    const methodAuth = Reflect.getMetadata(API_AUTH_KEY, context.getHandler());
    const classAuth = Reflect.getMetadata(API_AUTH_KEY, context.getClass());
    logger.log('methodAuth' + methodAuth);
    logger.log('classAuth' + classAuth);
    logger.log(methodAuth, classAuth, '守卫中', request.method, request.url);

    // 白名单数组
    // 如果白名单内的路由就不拦截直接通过
    if (this.hasUrl(this.urlList, request.url)) {
      return true;
    }
    // 验证token的合理性以及根据token做出相应的操作
    if (token) {
      try {
        // 这里可以添加验证逻辑

        const userInfo: any = this.authService.verifyToken(token);
        logger.log('当前登录用户信息：' + JSON.stringify(userInfo));

        // const isExpire: boolean = userInfo.exp > Number(new Date().getTime() / 1000);
        // logger.log(`token是否过期：` + isExpire);
        if (userInfo) {
          request.user = userInfo;
          if (methodAuth || classAuth) {
            const method = request.method;
            const url = request.url;
       
            return this.authService.apiAuth(userInfo,method,url);
          } else {
            return true;
          }
        } else {
          throw new HttpException(
            'token已过期,请先登录',
            HttpStatus.UNAUTHORIZED,
          );
        }
      } catch (e) {
        throw new HttpException(
          'token已过期,请先登录',
          HttpStatus.UNAUTHORIZED,
        );
      }
    } else {
      throw new HttpException('token已过期,请先登录', HttpStatus.UNAUTHORIZED);
    }
  }

  // 验证该次请求是否为白名单内的路由
  private hasUrl(urlList, url: string): boolean {
    let flag: boolean = false;
    urlList.forEach((item) => {
      if (item.path.indexOf(url) >= 0) {
        flag = true;
      }
    });
    return flag;
  }
}
