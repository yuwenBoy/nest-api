import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common/services';
// import { PostDataDto } from './dto/hello.dto';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleModule } from '../../entities/t_role_module.entity';

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
      Logger.error('【查询getRoleModuleById接口失败】，原因：'+error);
    }
  }
}
