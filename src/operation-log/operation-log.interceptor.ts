// src/operation-log/operation-log.interceptor.ts
import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
  } from '@nestjs/common';
  import { Observable } from 'rxjs';
  import { tap } from 'rxjs/operators';
  import { OperationLogService } from './operation-log.service';
  import { Request } from 'express';
import { OperationLogEntity } from 'src/entities/admin/t_operation_log.entity';
import { User } from 'src/common/types/user.type';
import { SKIP_LOG_METADATA } from 'src/common/decorators/skip-log.decorator';
import { Reflector } from '@nestjs/core';
import { IpGeolocationService } from 'src/common/services/ip-geolocation.service';
  
  @Injectable()
  export class OperationLogInterceptor implements NestInterceptor {
    constructor(private readonly logService: OperationLogService,
        private readonly geolocationService: IpGeolocationService,
        private reflector: Reflector,
    ) {}
  
      async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
      const request = context.switchToHttp().getRequest<Request>();
      const { method, originalUrl, ip, headers } = request;
      const user = request.user as User || {username:'Anonymous',id:null,userType:null}; // 使用 User 类型注解 user
      console.log('当前用户',user)

      // 检查是否被标记为跳过日志
      const skipLog = this.reflector.get<boolean>(SKIP_LOG_METADATA, context.getHandler()) ||
      this.reflector.get<boolean>(SKIP_LOG_METADATA, context.getClass());
        // 如果标记为跳过日志，则直接处理请求，不记录日志
      if (skipLog) {
         return next.handle()
      }
      const startTime = Date.now();


      // 获取客户端的真实 IP 地址
      let clientIp: string = ip;
      if (headers['x-real-ip']) {
        clientIp = headers['x-real-ip'] as string;
      } else if (headers['x-forwarded-for']) {
        const forwardedFor = headers['x-forwarded-for'] as string | string[];
        clientIp = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
      }

    // 获取地理位置信息
    const geolocation = await this.geolocationService.getGeolocation(clientIp);
    console.log('geolocation',geolocation)
  
      return next.handle().pipe(
        tap(async (response) => {
          const duration = Date.now() - startTime;
          const isError = response?.code !== 0;
          const httpStatus = context.switchToHttp().getResponse().statusCode;
          const log = new OperationLogEntity();
          log.operator = user.username;
          log.userId = user.id;
          log.userType = user.userType;
          log.appType = this.getAppType(headers['x-app-type'] as string);
          log.errorStack = isError ? JSON.stringify(response) : null;
          log.businessId = this.extractBusinessId(request,response);
          log.logLevel = this.getLogLevel(httpStatus,response?.code);
          log.operationType = method;
          log.operationContent = `${method} ${originalUrl}`;
          log.requestMethod = method;
          log.requestPath = originalUrl;
          log.requestParams = JSON.stringify(request.body || {});
          log.clientIp = clientIp;
          log.userAgent = headers['user-agent'];
          log.responseData = JSON.stringify(response || {}); // 假设响应体中包含操作后数据
          log.operationTime = new Date();
          log.duration = duration; // 记录执行时间
          log.statusCode = response?.code ?? 200; // 记录响应状态码
          log.requestHeaders = JSON.stringify(headers || {}); // 记录请求头
        //   log.geolocation = geolocation; // 记录地理位置信息
  
           // 异步保存日志 不影响请求响应
           this.logService.save(log).catch(err=>{
             console.error('日志保存失败:', err);
           });
        }),
      );
    }

      // 获取应用类型
  private getAppType(header?: string): number {
    const map: Record<string, number> = {
      'merchant': 2,
      'admin': 1,
      'customer': 3,
      'rider': 4,
      '1': 1, '2': 2, '3': 3, '4': 4
    };
    return map[header?.toLowerCase()] || 0;
  }

  // 根据 URL 猜测用户类型（备用）
  private guessUserType(url: string): number {
    if (url.includes('/customer/') || url.includes('/api/c/')) return 1;
    if (url.includes('/rider/') || url.includes('/api/r/')) return 2;
    if (url.includes('/merchant/') || url.includes('/api/m/')) return 3;
    if (url.includes('/admin/') || url.includes('/api/a/')) return 4;
    return 0;
  }

  // 提取业务ID
  private extractBusinessId(req: Request, res: any): string | null {
    // 优先从响应数据中提取
    if (res?.data?.orderId) return res.data.orderId;
    if (res?.data?.id) return String(res.data.id);
    
    // 从请求参数提取
    if (req.params?.orderId) return req.params.orderId;
    if (req.params?.id) return req.params.id;
    
    // 从请求体提取
    if (req.body?.orderId) return req.body.orderId;
    if (req.body?.id) return String(req.body.id);
    
    // 从查询参数提取
    if (req.query?.orderId) return req.query.orderId as string;
    
    return null;
  }

  // 判断日志级别
  private getLogLevel(httpStatus: number, bizCode?: number): number {
    if (httpStatus >= 500 || bizCode >= 500) return 3; // ERROR
    if (httpStatus >= 400 || bizCode >= 400) return 2; // WARN
    return 1; // INFO
  }
  }
  