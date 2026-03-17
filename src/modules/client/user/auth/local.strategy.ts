// local.strategy.ts
import { PassportStrategy } from '@nestjs/passport';
import { IStrategyOptions, Strategy } from 'passport-local';

import {
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { UserService } from '../service/user.service';

@Injectable()
export class LocalStorage extends PassportStrategy(Strategy) {
  constructor(private readonly authService: UserService) {
    super();
  }
}
