// common/guard/auth.guard.ts

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { getUrlQuery } from '../../../utils/url';
import { AuthService } from '../../admin/system/service/auth.service';
@Injectable()
// 门店过滤器
export class AuthStoreFilterGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
  ) {}

  // context 请求的(Response/Request)的引用
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const logger: Logger = new Logger('auth.store.guard.ts');
    logger.log('store过滤器开始验证...');
    // 获取请求对象
    const request = context.switchToHttp().getRequest();
    // 获取请求头中的token字段
    const token =
      context.switchToRpc().getData().headers.authorization ||
      context.switchToHttp().getRequest().body.authorization ||
      getUrlQuery(request.url, 'authorization');
    const userInfo = this.authService.verifyToken(token);
    logger.log(
      'store过滤器开始验证token成功,userInfo...' + JSON.stringify(userInfo),
    );
    request.user = userInfo;
    let userType = parseInt(request.user.userType);
    if (userType === 1) {
      request.storeQuery = {};
      request.queryParams = {};
      request.currentStoreId = null; // 平台用户没有门店
    } else {
      const storeIdFromHeader = request.headers['x-store-id'];
      console.log('storeIdFromHeader', storeIdFromHeader);
      // 商家用户：必须验证门店
      if (!storeIdFromHeader) {
        throw new Error('Header缺少X-Store-Id');
      }
      request.currentStoreId = storeIdFromHeader; // 商家用户有门店
      request.storeQuery = { store_id: storeIdFromHeader };
      request.queryParams = { store_id: storeIdFromHeader };
    }
    return true;
  }
}
