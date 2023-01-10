// local.strategy.ts
import { compareSync } from 'bcryptjs';
import { PassportStrategy } from '@nestjs/passport';
import { IStrategyOptions, Strategy } from 'passport-local';
// import { UserEntity } from '../../entities/t_user.entity'
// import { Repository } from 'typeorm';
// import { InjectRepository } from '@nestjs/typeorm';
import { AuthService} from './auth.service';

import { BadRequestException, Body, HttpException, HttpStatus, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ToolsService } from 'src/utils/tools/ToolsService';
// import { loginParamDto } from '../user/dto/user.dto';

@Injectable()
export class LocalStorage extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
  ) {
   
    super();
  }

  async validate(username:string,password:string):Promise<any> {
      const user = await this.authService.validateUser(username,password);
      console.log(user)
      if(!user) {
        console.log(123)
        // ToolsService.fail('用户名或密码错误！')
        // throw new HttpException('用户名或密码错误',HttpStatus.BAD_REQUEST);
        console.log(456)
        throw new UnauthorizedException('用户名或密码错误！');
        // throw new BadRequestException('用户名或密码错误！');
      } 
      return user;
  }
}
