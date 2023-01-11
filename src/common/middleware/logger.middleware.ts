import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  //req：申请参数
  //res：响应参数
  //next：执行下一个中件间
  use(req: Request, res: Response, next: () => void) {
    const { method, path } = req;
    console.log(`${method} ${path}`);
    next();
  }
}