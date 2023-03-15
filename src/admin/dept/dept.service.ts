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
      };
      parameter.pid = parameter.pid ? parameter.pid : 0;
      findSql.where.push({ parent_id: parameter.pid });
      if(parameter.DepartmentName){
        findSql.where.push({ department_name:Like(`%${parameter.DepartmentName}%`) })
      }
      let data = await this.deptRepository.find(findSql);
      let list = [];
      for (let i = 0; i < data.length; i++) {
        let isChild = await this.deptRepository
          .createQueryBuilder('dept')
          .where('dept.parent_id = :pid', { pid: data[i].id })
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
}
