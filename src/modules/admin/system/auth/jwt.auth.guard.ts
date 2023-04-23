import {
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { AuthService } from '../service/auth.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
//   constructor(
//     private readonly reflector: Reflector,
//     @Inject(AuthService)
//     private readonly authService: AuthService,
//   ) {
//     super();
//   }
//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const logger: Logger = new Logger('jwt.auth.guard.ts');
//      // 函数，类 是否允许 无 token 访问
//      const allowAnon = this.reflector.getAllAndOverride<boolean>('allowAnon', [context.getHandler(), context.getClass()])
//      if (allowAnon) return true
//     const req = context.switchToHttp().getRequest();
//     const accessToken = req.get('Authorization');
//     logger.log(`jwt鉴权验证token是否过期.......` + accessToken);
//     if (!accessToken) throw new ForbiddenException('请先登录');
//     const atUser = this.authService.verifyToken(accessToken);
//     if (!atUser) throw new UnauthorizedException('当前登录已过期，请重新登录');
//     logger.log('atUser'+JSON.stringify(atUser))
//     return this.activate(context);
//   }

//   async activate(ctx: ExecutionContext): Promise<boolean> {
//     return super.canActivate(ctx) as Promise<boolean>;
//   }
}
