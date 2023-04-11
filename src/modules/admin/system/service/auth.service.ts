//auth.service.ts
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from 'src/entities/admin/t_user.entity';
import { ModuleService } from './module.service';
import { RoleModuleService } from './roleModule.service';

import { UserRoleService } from './userRole.service';
import { compareSync, hashSync } from 'bcryptjs';
import { jwtContants, refreshExpiresIn } from 'src/modules/common/collections-permission/constants/jwtContants';
import { UserService } from './user.service';
import { UserInfo } from 'os';
import { UserInfoDto } from '../dto/user/userInfo.dto';
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
    if (user && compareSync(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  /**
   * 判断用户是否具有操作权限
   * @param user 
   * @param method 
   * @param url 
   * @returns 
   */
  public async apiAuth(user:UserInfoDto,method:string,url:string):Promise<boolean>{
    const  {id } = user;
    const authRoleIdList:number[] = await this.userRoleService.getRoleIds(id);
    if(!authRoleIdList.length){
        throw new HttpException( `当前账号没有操作:${method} - ${url}的权限`,HttpStatus.OK)
    }
    const moduleList = await this.roleModuleService.getModuleIds(authRoleIdList.toString());
    const formatUrl = this.formatUrl(method,url);
    // 模块表新增url接口 如果请求和数据库相同有权限，否则没有权限
    const isExist = true;
    if(isExist){
        return true;
    }
  }

  private formatUrl(method: string, url: string): string {
    switch (method) {
      case 'GET':
        // 去除问号后面的
        return url.substring(0, url.indexOf('?'));
      case 'DELETE':
      case 'PATCH':
      case 'PUT':
        // url最后一个改为*通配符
        return url.replace(/(.*?\/)\d+$/, '$1*');
      default:
        return url;
    }
  }
  /**
   * 验证通过，生成token返回给客户端
   * @param user 用户信息
   * @returns 返回token和用户信息
   */
  async login(user: Partial<UserEntity>) {
    console.log('user=============================' + user);
    const payload = { username: user.username, id: user.id };
    return {
      ...(await this.userInfo(user.id)),
      ...this.genToken(payload),
    };
  }

  async updateToken(user: UserInfoDto): Promise<any> {
    return this.genToken(user);
  }

  async logout(): Promise<void> {
    return null;
  }

  /**
   * 生成 刷新 token
   * @returns 返回token
   */
  genToken(payload: any): CreateTokenDto {
    const accessToken = `Bearer ${this.jwtService.sign(payload, jwtContants)}`;
    const refreshToken = this.jwtService.sign(payload, {
        secret: jwtContants.secret,
        expiresIn: refreshExpiresIn, // 刷新token2小时之内，超过两小时token过期  
      });
    return {
      accessToken,
      refreshToken,
    };
  }

  /** 校验 token */
  verifyToken(token: string): string {
    try {
      if (!token) return null;
      const user = this.jwtService.verify(
        token.replace('Bearer ', ''),
        jwtContants,
      );
      return user;
    } catch (error) {
      return null;
    }
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
