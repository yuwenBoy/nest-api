// local.strategy.ts
import { compareSync } from 'bcryptjs';
import { PassportStrategy } from '@nestjs/passport';
import { IStrategyOptions, Strategy } from 'passport-local';
import { UserEntity } from '../../entities/t_user.entity'
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Body, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { loginParamDto } from '../user/dto/user.dto';

@Injectable()
export class LocalStorage extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {
   
    super({
      passwordField: 'password',
      usernameField: 'username',
    } as IStrategyOptions);
  }

  async validate(username:string,password:string):Promise<any> {
    console.log('auth验证开始');
    console.log(username);
    // console.log(this.userRepository .createQueryBuilder('user'));
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.username=:username', { username:username })
      .getOne();

    console.log(user);
    if (!user) {
       throw new BadRequestException('用户名不正确！');
    }

    if (!compareSync(password, user.password)) {
      throw new BadRequestException('密码错误！');
    }
    
  }
}
