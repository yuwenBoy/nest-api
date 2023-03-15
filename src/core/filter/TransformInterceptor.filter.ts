import {CallHandler, ExecutionContext, Injectable,NestInterceptor,} from '@nestjs/common';
import { classToPlain } from 'class-transformer';
import { map, Observable } from 'rxjs';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // 和前端返回格式一致
    // data 如果返回字符串就提示信息，否则操作成功
    return next.handle().pipe(
      map((data:any) => {
        return {
          success:typeof data === 'string' ? false: true,
          result: classToPlain(data),
          // result,
          code: typeof data === 'string' ? -1 : 0,
          message: typeof data === 'string' ? data: '请求成功',
        };
      }),
    );
  }
}