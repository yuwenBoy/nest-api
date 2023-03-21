import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common/services';
// import { PostDataDto } from './dto/hello.dto';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleModule } from 'src/entities/admin/t_role_module.entity';

@Injectable()
export class RoleModuleService {
  // 使用InjectRespository装饰器并引入Repository这样就可以使用typeorm的操作了
  constructor(
    @InjectRepository(RoleModule)
    private readonly roleModuleRepository: Repository<RoleModule>,
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
   * @param parameter 角色id 模块ids
   * @param user 用户信息
   * @returns 对象
   */

  async saveOptionAuthority(parameter: any, user: any): Promise<boolean> {
    await this.delete(parameter);
    parameter.moduleId.forEach(async (item) => {
      await this.save(
        {
          id: null,
          roleId: parameter.roleId,
          moduleId: item,
        },
        user,
      );
    });
    return true;
  }

  /**
   * 保存角色模块表
   * @param parameter 参数
   * @returns 布尔类型
   */
  async save(parameter: any, user: any): Promise<any> {
    Logger.log(`请求参数：${JSON.stringify(parameter)}`);
    try {
      if (!parameter.id) {
        parameter.create_by = user.username;
      }
      // 必须用save 更新时间才生效
      let res = await this.roleModuleRepository.save(parameter);
      if (res.id > 0) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      Logger.error(`【新增|编辑】用户请求失败：${JSON.stringify(error)}`);
    }
  }

  // 删除
  async delete(params: any): Promise<boolean> {
    Logger.log(`请求删除参数：${JSON.stringify(params)}`);
    try {
      let a = await this.roleModuleRepository
        .createQueryBuilder()
        .delete()
        .from(RoleModule)
        .where('t_role_id = :roleId', { roleId: params.roleId })
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

  /**
   * 删除关系表（角色模块表）
   * @param params 模块ids
   * @returns
   */
  async deleteByModuleIds(params: any): Promise<boolean> {
    Logger.log(`请求删除参数：${JSON.stringify(params)}`);
    try {
      let entityList = await this.roleModuleRepository.query(
        `select * from t_role_module where t_module_id IN (${params.toString()})`,
      );
      let a = await this.roleModuleRepository.remove(entityList);
      Logger.log(`删除返回数据：${JSON.stringify(a)}`);
      if (a.length == 0) {
        return false;
      } else {
        return true;
      }
    } catch (error) {
      Logger.log(`请求失败：${JSON.stringify(error)}`);
      return false;
    }
  }
}
