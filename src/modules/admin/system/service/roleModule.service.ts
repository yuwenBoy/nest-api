import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common/services';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { RoleModuleEntity } from 'src/entities/admin/t_role_module.entity';
import { RoleModuleDto } from '../dto/roleModule.dto';
import { UserInfoDto } from '../dto/user/userInfo.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class RoleModuleService {
  // 使用InjectRespository装饰器并引入Repository这样就可以使用typeorm的操作了
  constructor(
    @InjectRepository(RoleModuleEntity)
    private readonly roleModuleRepository: Repository<RoleModuleEntity>,

    /**
     * 注册事物管理器
     */
    @InjectEntityManager()
    private readonly roleModuleManager: EntityManager,
  ) {}

  /**
   * 根据角色ids获取模块ids
   * @param roleIds 角色id
   * @returns 返回模块id list
   */
  async getModuleIds(roleIds: string): Promise<any> {
    let result = await this.roleModuleRepository
      .createQueryBuilder('roleModule')
      .select('roleModule.t_module_id')
      .where('roleModule.t_role_id IN (' + roleIds + ')')
      .setParameter('t_role_id', roleIds)
      .getRawMany();
    return result;
  }

  /**
   * 根据角色ids获取模块ids
   * @param roleIds 角色id
   * @returns 返回模块id list
   */
  async getRoleModuleById(roleId: Number): Promise<any> {
    try {
      return await this.roleModuleRepository
        .createQueryBuilder('roleModule')
        .select('t_module_id')
        .where('roleModule.t_role_id=:roleId', { roleId: roleId })
        .getRawMany();
    } catch (error) {
      Logger.error('【查询getRoleModuleById接口失败】，原因：' + error);
    }
  }

  /**
   * 保存角色模块关系权限
   * @param parameter roleId moduleId
   * @param user 用户信息
   * @returns 返回是否成功与失败
   */

  async saveOptionAuthority(
    dto: RoleModuleDto,
    currentUser: UserInfoDto,
  ): Promise<any> {
    try {
      Logger.log('角色模块服务层获取参数：' + dto);
      const roleModuleList = plainToInstance(
        RoleModuleEntity,
        dto.moduleId.map((moduleId) => {
          return {
            moduleId,
            roleId: dto.roleId,
            create_by: currentUser.username,
          };
        }),
      );
      const res = await this.roleModuleManager.transaction(
        async (transactionalEntityManager) => {
          // 先删除旧数据
          await transactionalEntityManager.delete(RoleModuleEntity, {
            roleId: dto.roleId,
          });
          // 保存新数据
          const result =
            await transactionalEntityManager.save<RoleModuleEntity>(
              roleModuleList,
            );
          return result;
        },
      );
      if (!res) return '授权资源失败';
      return true;
    } catch (error) {
      Logger.error('角色模块服务层saveOptionAuthority方法异常，原因：' + error);
    }
 
  }

  /**
   * 根据模块id获取角色id 多个
   * @param moduleIds ids 
   * @returns 
   */
  async getRoleIdByModuleIds(moduleIds: string[]): Promise<any> {
    return  await this.roleModuleRepository.query(
        `select t_role_id from t_role_module where t_module_id IN (${moduleIds.toString()})`,
      );
  }
}
