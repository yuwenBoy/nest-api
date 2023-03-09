import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeptEntity } from '../../entities/dept.entity';
import { deptToTree } from './dto/elTree';

@Injectable()
export class DeptService {
  // 使用InjectRespository装饰器并引入Repository这样就可以使用typeorm的操作了
  constructor(
    @InjectRepository(DeptEntity)
    private readonly deptServiceRepository: Repository<DeptEntity>,
  ) {}

  // 判斷是否存在下級部門
  async getDownDept(id: Number): Promise<any> {
    let res = await this.deptServiceRepository
      .createQueryBuilder('dept')
      .where('dept.parent_id = :parent_id', { parent_id: id })
      .getCount();
    return res;
  }

  /**
   * 根据角色ids获取模块ids
   * @param roleIds 角色id
   * @returns 返回模块id list
   */
  async getDeptAll(pid: Number): Promise<any> {
    let parentId = pid ? pid : 0;
    const deptList = await this.deptServiceRepository.query(
      `select department_name name,department_name label,parent_id pid,id   from t_department where parent_id = ${parentId}`,
    );
    setTimeout(() => {
      deptList.forEach(async (item) => {
        item.leaf =
          parentId > 0
            ? (await this.getDownDept(item.id)) > 0
              ? true
              : false
            : false;
        item.hasChildren = !item.leaf;
        console.log('=============item============', item);
      });
    }, 2000);
    console.log('=============deptList============', deptList);
    return deptList;
  }


  /**
   * 查询全部机构
   */
  async getDeptTree(pid = 0):Promise<any> {
  return  await this.deptServiceRepository.find();
  }
}
