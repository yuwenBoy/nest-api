import { Injectable } from '@nestjs/common';
import { PostDataDto } from './dto/hello.dto';

@Injectable()
export class HelloService {
  getHello(id: string): string {
    // 这里可以进行数据哭的相关操作，最后将需要返回的数据return出去
    return `hello GET 参数id:${id}`;
  }
  postHello(data: PostDataDto) {
    return `hello POST 参数code:${data.code};name:${data.name}`;
  }
  updateHello(id: string, message: string): string {
    return `hello Patch 参数id:${id};message:${message}`;
  }
  removeHello(id: number): string {
    return `hello delete 参数id:${id}`;
  }
}
