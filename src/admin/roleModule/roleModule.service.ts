import { Injectable } from '@nestjs/common';
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
 async getModuleIds(roleIds: string) : Promise<any> {
    let result =  await this.roleModuleRepository
    .createQueryBuilder('roleModule')
    .select('roleModule.t_module_id')
    .where('roleModule.t_role_id IN ('+roleIds+')')
    .setParameter('t_role_id',roleIds)
    .getRawMany();
    console.log(`=====角色id为${roleIds}======的模块id为================${result.map(item=>{return item.t_module_id})}`);
    return result;
 }

}
