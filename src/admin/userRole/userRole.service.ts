import { Injectable, Logger } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '../../entities/t_user_role.entity';

@Injectable()
export class UserRoleService {
  // 使用InjectRespository装饰器并引入Repository这样就可以使用typeorm的操作了
  constructor(
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
  ) {}

  /**
   * 根据用户id获取用户角色
   * @param account 用户id
   * @returns 返回角色list
   */
  async getRoleIds(userId: Number): Promise<any> {
    let result = await this.userRoleRepository
      .createQueryBuilder('userRole')
      .select('userRole.role_id')
      .where('userRole.user_id = :userId', { userId: userId })
      .getRawMany();
    return result;
  }

    /**
   * 删除用户判断用户是否关联角色
   * @param account 用户id
   * @returns 返回角色list
   */
    async getRoleIdsByUserIds(userId: any): Promise<any> {
      let result = await this.userRoleRepository.query('select us.username,ur.* from t_user us inner join t_user_role ur on us.id = ur.user_id where ur.user_id IN ('+ userId.toString()+')')
      return result;
    }

       /**
   * 删除角色判断角色是否关联用户
   * @param account 用户id
   * @returns 返回用户list
   */
       async getUserByRoleIds(roleId: any): Promise<any> {
        let result = await this.userRoleRepository.query('select r.name,ur.* from t_user_role ur inner join t_role r on ur.role_id = r.id where ur.role_id  IN ('+ roleId.toString()+')')
        return result;
      }
  

  // 删除
  async delete(params: any): Promise<boolean> {
    Logger.log(`请求删除参数：${JSON.stringify(params)}`);
    try {
      let a = await this.userRoleRepository.createQueryBuilder()
      .delete()
      .from(UserRole)
      .where("user_id = :userId", { userId: params.userId })
      .execute();
      Logger.log(`删除返回数据：${JSON.stringify(a)}`);
      if (a.affected == 0) {
        return false;
      } else {
        return true;
      }
    } catch (error) {
      Logger.log(`请求失败：${JSON.stringify(error)}`);
      return false;
    }
  }

  // 增加/更新
  async save(parameter: any): Promise<boolean> {
    Logger.log(`请求参数：${JSON.stringify(parameter)}`);
    try {
      let res = await this.userRoleRepository
        .createQueryBuilder()
        .insert()
        .into(UserRole)
        .values([parameter])
        .execute();

      if (res.raw) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      Logger.log(`请求失败：${JSON.stringify(error)}`);
      return false;
    }
  }
}
