import { Injectable, Logger } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, Like } from 'typeorm';
import { DeptEntity } from '../../entities/dept.entity';

@Injectable()
export class DeptService {
  // 使用InjectRespository装饰器并引入Repository这样就可以使用typeorm的操作了
  constructor(
    @InjectRepository(DeptEntity)
    private readonly deptRepository: Repository<DeptEntity>,
  ) {}

  /**
   * 查询机构列表
   * @param parameter 查询条件
   * @returns list
   */
  async pageQuery(parameter: any): Promise<any> {
    try {
      console.log(
        'service层查询机构列表接受参数：' + JSON.stringify(parameter),
      );
      let result = {
        content: [],
      };
      let findSql = {
        where: [],
        
        order:{}
      };
      parameter.pid = parameter.pid ? parameter.pid : 0;
      findSql.where.push({ parent_id: parameter.pid });
      if(parameter.DepartmentName){
        findSql.where.push({ department_name:Like(`%${parameter.DepartmentName}%`) })
      }
      if (parameter.sort) findSql.order[parameter.sort] = 'ASC';
      let data = await this.deptRepository.find(findSql);
      let list = [];
      for (let i = 0; i < data.length; i++) {
        let isChild = await this.deptRepository
          .createQueryBuilder('dept')
          .where('dept.parent_id = :pid', { pid: data[i].id })
          // .orderBy(`dept.${parameter.sort}`,'DESC')
          .getMany();
        data[i].hasChildren = isChild.length > 0 ? true : false;
        data[i].typeName = data[i].department_type == 1? '机构':'部门'
        list.push(data[i]);
      }

      result.content = list;
      return result;
    } catch (error) {
      Logger.error(`机构列表请求失败,原因：${JSON.stringify(error)}`);
      return false;
    }
  }

  /**
   * 查询全部机构
   */
  async getDeptTree(): Promise<any> {
    try {
      return await this.deptRepository
        .createQueryBuilder('dept')
        .select([
          'id',
          'department_name AS label',
          'parent_id',
          'department_type AS type',
        ])
        .where('1=1')
        .getRawMany();
    } catch (error) {
      Logger.error('查询机构失败，原因：' + error);
    }
  }

  
  
  /**
   * 新增|编辑 组织
   * @param parameter 参数
   * @returns 布尔类型
   */
  async save(parameter: any,user:any): Promise<any> {
    Logger.log(`请求参数：${JSON.stringify(parameter)}`);
    try {
      if (!parameter.id) {
        const { department_name } = parameter;
        const existUser = await this.deptRepository.exist({
          where: { department_name },
        });
        if (existUser) {
          return '组织已存在';
        }
        parameter.create_by = user.username;
      }else{
        parameter.update_by = user.username;
      }
      // 必须用save 更新时间才生效
      let res = await this.deptRepository.save(parameter);
      if (res.id > 0) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      Logger.error(`【新增|编辑】组织请求失败：${JSON.stringify(error)}`);
    }
  }

  /**
   * 批量删除
   * @param ids id
   * @returns
   */
  async delete(ids: any): Promise<any> {
    Logger.log(`【批量删除角色】请求参数：${JSON.stringify(ids)}`);
    try {
    
      // // 查询角色是否有关联的模块
      // let roleModuleEntity = await this.deptRepository.query(`select m.name,rm.* from t_role_module rm inner join t_module m on rm.t_module_id = m.id where rm.t_role_id IN (${ids})`);

      // if(roleModuleEntity.length > 0) {
      //    return `当前角色已有关联的资源，删除失败。`;
      // }  

      // // 查询当前角色是否关联用户
      // let userRoleModal = await this.userRoleService.getUserByRoleIds(ids);
      // let name = userRoleModal.map((r=>{return r.name})).toString();
      // if (userRoleModal.length > 0) {
      //   return `角色【${name}】已关联账号，删除失败。`;
      // }
      let a = await this.deptRepository.delete(ids);
      Logger.log(`【批量删除组织】删除返回数据：${JSON.stringify(a)}`);
      if (a.affected == 0) {
        return false;
      } else {
        return true;
      }
    } catch (error) {
      Logger.log(`【批量删除组织】请求失败：${JSON.stringify(error)}`);
      return false;
    }
  }
}
