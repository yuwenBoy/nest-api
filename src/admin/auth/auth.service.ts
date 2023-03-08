//auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from 'src/entities/t_user.entity';
import { Any, Repository } from 'typeorm';
import { ModuleService } from '../module/module.service';
import { RoleModuleService } from '../roleModule/roleModule.service';

import {UserService} from '../user/user.service';
import { UserRoleService } from '../userRole/userRole.service';
import { jwtContants } from './jwt.contants';
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly userRoleService: UserRoleService,
    private readonly roleModuleService: RoleModuleService,
    private readonly moduleService: ModuleService,
  ) {}

  // 2.验证账号密码是否正确，正确返回user 错误返回null
  async validateUser(account: string, pass: string): Promise<any> {
    const user = await this.userService.getUserAccout(account);
    if (user && user.password === '123456') {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  // 生成token
  createToken(user: Partial<UserEntity>) {
    return this.jwtService.sign(user);
  }

  // 验证通过，生成token返回给客户端
  async login(user: Partial<UserEntity>) {
    const payload = { username: user.username, id: user.id };
    const userInfo = await this.userService.getUserById(user.id);
    const roles = await this.userRoleService.getRoleIds(user.id);
    const role_ids = roles.map((item) => {
        return item.role_id;
      })
      .toString();
    const modules = await this.roleModuleService.getModuleIds(role_ids);
    const module_ids = modules
      .map((item) => {
        return item.t_module_id;
      })
      .toString();
    const roleList = await this.moduleService.getOptionByMenuId(module_ids);

    const login_success_res = {
      token: this.jwtService.sign(payload,jwtContants),
      user:{},
      roles:roleList
    }
    login_success_res.user = userInfo;
    return  login_success_res
  }
}
