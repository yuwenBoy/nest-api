import { Injectable, Logger } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRoleEntity } from 'src/entities/admin/t_user_role.entity';

@Injectable()
export class UserRoleService {
  // 使用InjectRespository装饰器并引入Repository这样就可以使用typeorm的操作了
  constructor(
    @InjectRepository(UserRoleEntity)
    private readonly userRoleRepository: Repository<UserRoleEntity>,
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
}
