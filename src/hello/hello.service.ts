import { Injectable } from '@nestjs/common';
import { PostDataDto } from './dto/hello.dto';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserEntity } from 'src/entities/admin/t_user.entity';


@Injectable()
export class HelloService {
  // 使用InjectRespository装饰器并引入Repository这样就可以使用typeorm的操作了
  constructor(@InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,){}

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

  async findAll():Promise<UserEntity[]> {
    return await this.userRepository.query('select * from t_user');
  }
}
