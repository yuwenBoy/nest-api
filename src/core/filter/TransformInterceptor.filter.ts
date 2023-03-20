import {CallHandler, ExecutionContext, Inject, Injectable,NestInterceptor,} from '@nestjs/common';
import { classToPlain } from 'class-transformer';
import { map, Observable } from 'rxjs';
// import { OperationLogService } from 'src/security/operation.service';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  // constructor(@Inject(OperationLogService) private service: OperationLogService) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // this.service.context = context; //把context赋值到service上
    
    // 和前端返回格式一致
    // data 如果返回字符串就提示信息，否则操作成功
    return next.handle().pipe(
      map((data:any) => {
        return {
          success:typeof data === 'string' || data === false ? false: true,
          result: classToPlain(data),
          // result,
          code: typeof data === 'string' || data === false  ? -1 : 0,
          message: typeof data === 'string' ? data: (data === false?'请求失败':'请求成功'),
        };
      }),
    );
  }
}