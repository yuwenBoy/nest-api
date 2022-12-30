//auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from 'src/entities/t_user.entity';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
  ) {}

 // 生成token
  createToken(user: Partial<UserEntity>) {
    return this.jwtService.sign(user);
  }

  async login(user: Partial<UserEntity>) {
    const token = this.createToken({
      id: user.id,
      username: user.username,
      // role: user.role,
    });

    return { token };
  }
}
