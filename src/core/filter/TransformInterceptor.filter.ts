import {CallHandler, ExecutionContext, Injectable,NestInterceptor,} from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // 和前端返回格式一致
    return next.handle().pipe(
      map((result) => {
        return {
          result,
          code: 0,
          message: '请求成功',
        };
      }),
    );
  }
}