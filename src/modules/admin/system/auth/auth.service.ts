//auth.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from 'src/entities/admin/t_user.entity';
import { ModuleService } from '../module/module.service';
import { RoleModuleService } from '../roleModule/roleModule.service';

import { UserService } from '../user/user.service';
import { UserRoleService } from '../userRole/userRole.service';
import { compareSync, hashSync } from 'bcryptjs';
import adminConfig from 'src/config/admin.config';
import { jwtContants } from 'src/modules/common/collections-permission/constants/jwtContants';
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
    const defaultPass = adminConfig.DefaultPassWord;
    if (user && compareSync(defaultPass,pass)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  /**
   * 验证通过，生成token返回给客户端
   * @param user 用户信息
   * @returns 返回token和用户信息
   */
  async login(user: Partial<UserEntity>) {
    console.log('user============================='+user)
    const payload = { username: user.username, id: user.id };
    let res_success_token = {
      token: this.jwtService.sign(payload, jwtContants), // 生成token
      ...(await this.userInfo(user.id)),
    };
    return res_success_token;
  }

  /**
   * 查询用户信息
   * @param userId 用户id
   */
  async userInfo(userId: any): Promise<any> {
    try {
      let res = {
        user: {},
        roles: [],
      };
      const userInfo = await this.userService.getUserById(userId);
      res.user = userInfo;
      const roles = await this.userRoleService.getRoleIds(userId);
      if (roles.length > 0) {
        const role_ids = roles
          .map((item) => {
            return item.role_id;
          })
          .toString();
        const modules = await this.roleModuleService.getModuleIds(role_ids);
        if (modules.length > 0) {
          const module_ids = modules
            .map((item) => {
              return item.t_module_id;
            })
            .toString();
          res.roles = await this.moduleService.getOptionByMenuId(module_ids);
        }
      }
      return res;
    } catch (error) {
      Logger.error('查询用户信息异常，原因：' + error);
    }
  }
}
