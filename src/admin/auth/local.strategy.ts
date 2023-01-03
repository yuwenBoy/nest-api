// local.strategy.ts
import { compareSync } from 'bcryptjs';
import { PassportStrategy } from '@nestjs/passport';
import { IStrategyOptions, Strategy } from 'passport-local';
// import { UserEntity } from '../../entities/t_user.entity'
// import { Repository } from 'typeorm';
// import { InjectRepository } from '@nestjs/typeorm';
import { AuthService} from './auth.service';
import { BadRequestException, Body, HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
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
        throw new UnauthorizedException();
      } 
      return user;
  }
}
