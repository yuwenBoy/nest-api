import { Injectable, Logger } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, Like } from 'typeorm';
import { DeptEntity } from 'src/entities/admin/dept.entity';

@Injectable()
export class DeptService {
  // 使用InjectRespository装饰器并引入Repository这样就可以使用typeorm的操作了
  constructor(
    @InjectRepository(DeptEntity)
    private readonly deptRepository: Repository<DeptEntity>,
  ) {}

  /***
   * 组织列表转换成树形table展示
   */
  toTableTree(arr, pid) {
    return arr.reduce((res, current) => {
      if (current['parent_id'] == pid) {
        current['children'] = this.toTableTree(arr, current['id']);
        if (arr.filter((t) => t.parent_id == current['id']).length == 0) {
          current['children'] = undefined;
        }
        return res.concat(current);
      }
      return res;
    }, []);
  }

  /**
   * 转换成组织树形结构
   * @param arr
   * @param pid 父级id
   * @returns 组织树形结构
   */
  toDeptTree(arr, pid) {
    return arr.reduce((res, current) => {
      if (current['parent_id'] == pid) {
        let obj = { name: '', label: '', id: '', pid: '', children: [] };
        obj.name = current['label'];
        obj.label = current['label'];
        obj.id = current['id'];
        obj.pid = current['parent_id'];
        obj.children = this.toDeptTree(arr, current['id']);
        if (arr.filter((t) => t.parent_id == current['id']).length == 0) {
          obj.children = undefined;
        }
        return res.concat(obj);
      }
      return res;
    }, []);
  }

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
      let queryBuilder = await this.deptRepository.createQueryBuilder('dept');
      if (parameter.DepartmentName) {
        queryBuilder.where(
          'dept.department_name LIKE "%' + parameter.DepartmentName + '%"',
        );
      }
      queryBuilder.orderBy(`dept.${parameter.sort}`, 'ASC');
      let data = await queryBuilder.getMany();
      let result = {
        content: parameter.DepartmentName ? data : this.toTableTree(data, 0),
      };
      return {
        ...result,
      };
    } catch (error) {
      Logger.error(`机构列表请求失败,原因：${JSON.stringify(error)}`);
    }
  }

  /**
   * 查询全部机构转换成树形结构
   */
  async getDeptTree(): Promise<any> {
    try {
      let list = await this.deptRepository
        .createQueryBuilder('dept')
        .select([
          'id',
          'department_name AS label',
          'parent_id',
          'department_type AS type',
        ])
        .where('1=1')
        .getRawMany();
      let result = this.toDeptTree(list, 0);
      return result;
    } catch (error) {
      Logger.error('查询机构失败，原因：' + error);
    }
  }

  /**
   * 查询全部机构转换成树形结构
   */
  async getDeptAll(): Promise<any> {
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
  async save(parameter: any, userName: string): Promise<any> {
    Logger.log(`请求参数：${JSON.stringify(parameter)}`);
    try {
      if (!parameter.id) {
        parameter.create_by = userName;
      } else {
        parameter.update_by = userName;
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
