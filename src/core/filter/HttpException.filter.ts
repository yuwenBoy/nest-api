// // import {ArgumentsHost,Catch, ExceptionFilter, HttpException} from '@nestjs/common';

// // @Catch(HttpException)
// // export class HttpExceptionFilter implements ExceptionFilter {
// //   catch(exception: HttpException, host: ArgumentsHost) {
// //     const ctx = host.switchToHttp(); // 获取请求上下文
// //     const response = ctx.getResponse(); // 获取请求上下文中的 response对象
// //     const status = exception.getStatus(); // 获取异常状态码

// //     // 设置错误信息
// //     const message = exception.message
// //       ? exception.message
// //       : `${status >= 500 ? 'Service Error' : 'Client Error'}`;
// //     const errorResponse = {
// //       result: {},
// //       message: message,
// //       code: -1,
// //     };

// //     // 设置返回的状态码， 请求头，发送错误信息
// //     response.status(status);
// //     response.header('Content-Type', 'application/json; charset=utf-8');
// //     response.send(errorResponse);
// //   }
// // }

// import {
//   ArgumentsHost,
//   Catch,
//   ExceptionFilter,
//   HttpException,
// } from '@nestjs/common';

// //必须实现至ExceptionFilter，固定写法，该接口只有一个catch方法
// //catch方法参数：
// //exception：当前正在处理的异常对象
// //host：传递给原始处理程序的参数的一个包装(Response/Request)的引用
// @Catch(HttpException)
// export class HttpExceptionFilter implements ExceptionFilter<HttpException> {
//   catch(exception: HttpException, host: ArgumentsHost) {
//     const ctx = host.switchToHttp();
//     const response = ctx.getResponse();
//     const request = ctx.getRequest();

//     const code = exception.getStatus(); //获取状态码
//     const exceptionRes: any = exception.getResponse(); //获取响应对象
//     const { error, message } = exceptionRes;

//     //自定义的异常响应内容
//     const msgLog = {
//       code,
//       result:{},
//       // timestamp: new Date().toISOString(),
//       // path: request.url,
//       // error,
//       message:error,
//     };

//     response.status(code).json(msgLog);
//   }
// }


import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  // 如果有日志服务，可以在constructor,中挂载logger处理函数
  constructor(private readonly logger: Logger) {}
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp(); // 获取请求上下文
    const request = ctx.getRequest(); // 获取请求上下文中的request对象
    const response = ctx.getResponse(); // 获取请求上下文中的response对象
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR; // 获取异常状态码
    // 设置错误信息
    const message = exception.message
      ? exception.message
      : `${status >= 500 ? '服务器错误（Service Error）' : '客户端错误（Client Error）'}`;

    const nowTime = new Date().getTime();

    const errorResponse = {
      data: {},
      message,
      code: -1,
      date: nowTime,
      path: request.url,
    };
    // 将异常记录到logger中
    this.logger.error(
      `【${nowTime}】${request.method} ${request.url} query:${JSON.stringify(request.query)} params:${JSON.stringify(
        request.params,
      )} body:${JSON.stringify(request.body)}`,
      JSON.stringify(errorResponse),
      'HttpExceptionFilter',
    );
    // 设置返回的状态码， 请求头，发送错误信息
    response.status(status);
    response.header('Content-Type', 'application/json; charset=utf-8');
    response.send(errorResponse);
  }
}