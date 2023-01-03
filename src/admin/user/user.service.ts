import { Injectable } from '@nestjs/common';
// import { PostDataDto } from './dto/hello.dto';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../entities/t_user.entity';
import { loginParamDto } from './dto/user.dto';

@Injectable()
export class UserService {
  // 使用InjectRespository装饰器并引入Repository这样就可以使用typeorm的操作了
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  /**
   *
   * @param data 用户名、密码
   * 用户登录
   * @returns
   */
  login(data: loginParamDto) {
    const result = [];
    if (data) {
      let res = this.userRepository.query(`select * from t_user`);
      console.log(res);
      return res;
    } else {
      return [];
    }
  }

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

  async findAll(): Promise<UserEntity[]> {
    return await this.userRepository.query('select * from t_user');
  }

  /**
   * 根据用户名获取用户信息
   * @param account 用户名
   * @returns 返回单个用户信息
   */
  async getUserAccout(account: string): Promise<UserEntity> {
    return await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.username=:username', { username: account })
      .getOne();
  }

  /**
   * 根据用户id获取用户
   * @param userId 用户id
   */
  async getUserById(userId: string | number): Promise<UserEntity> {
    return await this.userRepository
      .createQueryBuilder('user')
      .where('user.id = :userId', { userId: userId })
      .getOne();
  }
}
