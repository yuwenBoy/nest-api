import { Injectable, Logger } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { PositionEntity } from 'src/entities/admin/position.entity';
import { PageEnum } from 'src/enum/page.enum';
import { PageListVo } from 'src/modules/common/page/pageList';
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
  async pageQuery(parameter: any): Promise<PageListVo> {
    try {
      const [pageIndex, pageSize] = [PageEnum.PAGE_NUMBER, PageEnum.PAGE_SIZE];

      let find_object = {
        where: [],
        order: {},
        skip: (pageIndex - 1) * Number(pageSize), // 分页，跳过几项
        take: pageSize, // 分页，取几项
        cache: false,
      };
      // 搜索条件
      if (parameter.name) {
        find_object.where.push({ name: Like(`%${parameter.name}%`) });
      }
      if (parameter.deptId > 0) {
        find_object.where.push({ deptId: parameter.deptId });
      }
      if (!parameter.name && !parameter.deptId) {
        delete find_object.where;
      }

      // 排序
      if (parameter.sort) find_object.order[parameter.sort] = 'DESC';

      const data = { content: await this.positionRepository.find(find_object) };
      const count: number = await this.positionRepository.count({
        where: find_object.where,
      });
      return {
        ...data,
        page: pageIndex,
        size: pageSize,
        totalPage: Math.ceil(count / pageSize),
        totalElements: count,
      };
    } catch (error) {
      Logger.log(`请求失败：${JSON.stringify(error)}`);
    }
  }

  /**
   * 新增|编辑 职位
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
