import { Injectable, Logger } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { PositionEntity } from 'src/entities/admin/position.entity';
import { Like, Repository } from 'typeorm';

@Injectable()
export class PositionService {
  // 使用InjectRespository装饰器并引入Repository这样就可以使用typeorm的操作了
  constructor(
    @InjectRepository(PositionEntity)
    private readonly positionRepository: Repository<PositionEntity>,
  ) {}

  /**
   * 查询职位
   * @param deptId 机构id
   * @returns 职位集合
   */
  async getPositionByDeptId(deptId: Number): Promise<any> {
    return await this.positionRepository
      .createQueryBuilder('posi')
      .select(['id AS value', 'name AS label'])
      .where('posi.t_department_id=:deptId', { deptId })
      .getRawMany();
  }

  /**
   *  职位列表
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

      let find_object = {
        where: [],
        order: {},
        skip: (parameter.page - 1) * Number(parameter.size), // 分页，跳过几项
        take: parameter.size, // 分页，取几项
        cache: false,
      };
      // 搜索条件
      if (parameter.name) {
        find_object.where.push({ name: Like(`%${parameter.name}%`) });
      } 
      if (parameter.deptId > 0) {
        find_object.where.push({ deptId: parameter.deptId });
      }
      if(!parameter.name && !parameter.deptId){
        delete find_object.where;
      }

      // 排序
      if (parameter.sort) find_object.order[parameter.sort] = 'DESC';

      console.log('00000000000000000000开始000000000000000000000000000')
      // 查询结果
      result.content = await this.positionRepository.find(find_object);
      console.log('00000000000000000000结束000000000000000000000000000')
      // 查询总数
      result.totalElements = await this.positionRepository.count({
        where: find_object.where,
      });

      // 总页数
      result.totalPage = Math.ceil(
        (await this.positionRepository.count({ where: find_object.where })) /
          parameter.size,
      );
      return result;
    } catch (error) {
      Logger.log(`请求失败：${JSON.stringify(error)}`);
      return false;
    }
  }

  /**
   * 新增|编辑 职位
   * @param parameter 参数
   * @returns 布尔类型
   */
  async save(parameter: any, user: any): Promise<any> {
    Logger.log(`请求参数：${JSON.stringify(parameter)}`);
    try {
      if (!parameter.id) {
        parameter.create_by = user.username;
      } else {
        parameter.update_by = user.username;
      }
      // 必须用save 更新时间才生效
      let res = await this.positionRepository.save(parameter);
      if (res.id > 0) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      Logger.error(`【新增|编辑】职位请求失败：${JSON.stringify(error)}`);
    }
  }

  /**
   * 批量删除
   * @param ids id
   * @returns
   */
  async delete(ids: any): Promise<any> {
    Logger.log(`【批量删除职位】请求参数：${JSON.stringify(ids)}`);
    try {
      let a = await this.positionRepository.delete(ids);
      Logger.log(`【批量删除职位】删除返回数据：${JSON.stringify(a)}`);
      if (a.affected == 0) {
        return false;
      } else {
        return true;
      }
    } catch (error) {
      Logger.log(`【批量删除职位】请求失败：${JSON.stringify(error)}`);
      return false;
    }
  }
}
