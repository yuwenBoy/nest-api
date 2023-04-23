import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryEntity } from 'src/entities/shop/category.entity';
import { toTableTree } from 'src/utils';
import { Repository } from 'typeorm';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  async list() {
   return await this.categoryRepository.query('select * from t_shop_category');
  }

  
  /**
   * 查询品类列表
   * @param parameter 查询条件
   * @returns list
   */
  async pageQuery(parameter: any): Promise<any> {
    try {
      console.log(
        'service层查询品类列表接受参数：' + JSON.stringify(parameter),
      );
      let queryBuilder = await this.categoryRepository.createQueryBuilder('cate');
      if (parameter.name) {
        queryBuilder.where(
          'cate.name LIKE "%' + parameter.name + '%"',
        );
      }
      queryBuilder.orderBy(`cate.${parameter.sort}`, 'ASC');
      queryBuilder.addOrderBy('cate.create_time','DESC');
      let data = await queryBuilder.getMany();
      let result = {
        content: parameter.name ? data : toTableTree(data, 0),
      };
      return {
        ...result
      };
    } catch (error) {
      Logger.error(`品类列表请求失败,原因：${JSON.stringify(error)}`);
    }
  }

  
  /**
   * 新增|编辑 品类
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
      let res = await this.categoryRepository.save(parameter);
      if (res.id > 0) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      Logger.error(`【新增|编辑】品类请求失败：${JSON.stringify(error)}`);
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
      let a = await this.categoryRepository.delete(ids);
      Logger.log(`【批量删除品类】删除返回数据：${JSON.stringify(a)}`);
      if (a.affected == 0) {
        return false;
      } else {
        return true;
      }
    } catch (error) {
      Logger.log(`【批量删除品类】请求失败：${JSON.stringify(error)}`);
      return false;
    }
  }
}