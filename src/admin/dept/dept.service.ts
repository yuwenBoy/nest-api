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
  async getDownDept(id:Number):Promise<any> {
    let res =  await this.deptServiceRepository.createQueryBuilder('dept')
    .where('dept.parent_id = :parent_id', { parent_id:id })
    .getCount();
   return res;
  }


 /**
   * 根据角色ids获取模块ids
   * @param roleIds 角色id
   * @returns 返回模块id list
   */
 async getDeptAll(pid: Number) : Promise<any> {
    let parentId = pid ? pid : 0 ;
    const deptList = await this.deptServiceRepository.query(`select * from t_department where parent_id = ${ parentId }`);
    const _elTreeList = [];
    deptList.forEach(item=>{
        const _elTree = new deptToTree();
        _elTree.id = item.id;
        _elTree.leaf = false;
         
       _elTree.hasChildren = false
        _elTree.label = item.department_name;
        _elTree.name = item.department_name;
        _elTreeList.push(_elTree);
    });
    return _elTreeList;
 }
}
