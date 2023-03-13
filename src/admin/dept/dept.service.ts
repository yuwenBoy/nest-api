import { Injectable, Logger } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { DeptEntity } from '../../entities/dept.entity';
import { deptToTree } from './dto/elTree';

@Injectable()
export class DeptService {
  // 使用InjectRespository装饰器并引入Repository这样就可以使用typeorm的操作了
  constructor(
    @InjectRepository(DeptEntity)
    private readonly deptRepository: Repository<DeptEntity>,
  ) {}


  /**
   * 用户列表
   * @param parameter 查询条件
   * @returns list
   */
  async pageQuery(parameter: any): Promise<any> {
    try {
      let result = {
        page: Number(parameter.page),
        size: Number(parameter.size),
        totalPage: 0,
        totalElements: 0,
        content: [],
      };
      result.content = await this.deptRepository
        .createQueryBuilder('dept')
        .where(
          new Brackets((qb) => {
            if (parameter.name) {
              return qb.where(
                'dept.department_name LIKE :cname',
                {
                  cname: `%${parameter.name}%`,
                },
              );
            } else {
              return qb;
            }
          }),
        )
        .orderBy(`user.${parameter.sort}`, 'DESC')
        .skip((parameter.page - 1) * Number(parameter.size))
        .take(parameter.size)
        .getMany();

      // 总条数
      result.totalElements = await this.deptRepository
        .createQueryBuilder('dept')
        .where(
          new Brackets((qb) => {
            if (parameter.name) {
              return qb.where(
                'dept.department_name LIKE :cname',
                {
                  cname: `%${parameter.name}%`
                },
              );
            } else {
              return qb;
            }
          }),
        )
        .getCount();

      // 总页数
      result.totalPage = Math.ceil(result.totalElements / parameter.size);

      return result;
    } catch (error) {
      Logger.log(`请求失败：${JSON.stringify(error)}`);
      return false;
    }
  }

  // // 判斷是否存在下級部門
  // async getDownDept(id: Number): Promise<any> {
  //   let res = await this.deptServiceRepository
  //     .createQueryBuilder('dept')
  //     .where('dept.parent_id = :parent_id', { parent_id: id })
  //     .getCount();
  //   return res;
  // }

  // /**
  //  * 根据角色ids获取模块ids
  //  * @param roleIds 角色id
  //  * @returns 返回模块id list
  //  */
  // async getDeptAll(pid: Number): Promise<any> {
  //   let parentId = pid ? pid : 0;
  //   const deptList = await this.deptServiceRepository.query(
  //     `select department_name name,department_name label,parent_id pid,id   from t_department where parent_id = ${parentId}`,
  //   );
  //   setTimeout(() => {
  //     deptList.forEach(async (item) => {
  //       item.leaf =
  //         parentId > 0
  //           ? (await this.getDownDept(item.id)) > 0
  //             ? true
  //             : false
  //           : false;
  //       item.hasChildren = !item.leaf;
  //       console.log('=============item============', item);
  //     });
  //   }, 2000);
  //   console.log('=============deptList============', deptList);
  //   return deptList;
  // }


  /**
   * 查询全部机构
   */
  async getDeptTree():Promise<any> {
    try {
      return  await this.deptRepository.find();
    }
    catch(error){
      Logger.error('查询机构失败，原因：'+error);
    }
  }
}
