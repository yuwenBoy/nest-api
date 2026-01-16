import { userInfo } from 'os';
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
      const user = request.user as User || {username:'Anonymous'}; // 使用 User 类型注解 user

      // 检查是否被标记为跳过日志
      const skipLog = this.reflector.get<boolean>(SKIP_LOG_METADATA, context.getHandler()) ||
      this.reflector.get<boolean>(SKIP_LOG_METADATA, context.getClass());

    if (skipLog) {
          return next.handle(); // 如果标记为跳过日志，则直接处理请求，不记录日志
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
          const endTime = Date.now();
          const duration = endTime - startTime;
          console.log('user.username======',user.username);
          const log = new OperationLogEntity();
          log.operator = user.username;
          log.operationType = method;
          log.operationContent = `${method} ${originalUrl}`;
          log.requestMethod = method;
          log.requestPath = originalUrl;
          log.requestParams = request.body;
          log.clientIp = ip;
          log.userAgent = headers['user-agent'];
          log.responseData = response; // 假设响应体中包含操作后数据
          log.operationTime = new Date();
          log.duration = duration; // 记录执行时间
          log.statusCode = response.code; // 记录响应状态码
          log.requestHeaders = headers; // 记录请求头
        //   log.geolocation = geolocation; // 记录地理位置信息
  
          await this.logService.save(log);
        }),
      );
    }
  }
  