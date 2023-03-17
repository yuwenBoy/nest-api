import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OperationLogService } from '../../security/operation.service';
@Injectable()
export class OperationLogInterceptor implements NestInterceptor {
  constructor(@Inject(OperationLogService) private service: OperationLogService) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    this.service.context = context; //把context赋值到service上
    return next.handle().pipe(
      map(data => {
        return data;
      }),
    );
  }
}