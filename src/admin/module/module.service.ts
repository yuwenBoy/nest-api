import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Module } from '../../entities/t_module.entity';

@Injectable()
export class ModuleService {
  // 使用InjectRespository装饰器并引入Repository这样就可以使用typeorm的操作了
  constructor(
    @InjectRepository(Module)
    private readonly moduleRepository: Repository<Module>,
  ) {}

  getHello(id: string): string {
    // 这里可以进行数据哭的相关操作，最后将需要返回的数据return出去
    return `hello GET 参数id:${id}`;
  }
  //   postHello(data: PostDataDto) {
  //     return `hello POST 参数code:${data.code};name:${data.name}`;
  //   }
  updateHello(id: string, message: string): string {
    return `hello Patch 参数id:${id};message:${message}`;
  }
  removeHello(id: number): string {
    return `hello delete 参数id:${id}`;
  }

  async findAll(): Promise<Module[]> {
    return await this.moduleRepository.query('select * from t_module');
  }
 
}
