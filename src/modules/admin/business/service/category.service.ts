import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { BusinessCategoryEntity } from '../../../../entities/business/category.entity';
import { toTableTree } from '../../../../utils';
import { EntityManager, getRepository, Repository } from 'typeorm';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(BusinessCategoryEntity)
    private readonly categoryRepository: Repository<BusinessCategoryEntity>,
    @InjectEntityManager()
    private entityManager: EntityManager,
  ) {}

  async list() {
   return await this.categoryRepository.query('select * from businesscategory');
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
        // 使用参数化查询来防止SQL注入
        queryBuilder.where('cate.category_name LIKE :name', { name: `%${parameter.name}%` });
      }
      queryBuilder.orderBy(`cate.${parameter.sort}`, 'ASC');
    //   queryBuilder.addOrderBy('cate.create_time','DESC');
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
   * 查询全部品类转换成树形结构
   */
    async getCategoryAll(): Promise<any> {      
        try {
          return await this.categoryRepository
            .createQueryBuilder('dept')
            .select([
              'id',
              'category_name AS label',
              'parent_id',
            ])
            .where('1=1')
            .getRawMany();
        } catch (error) {
          Logger.error('查询品类失败，原因：' + error);
        }
      }

  
  /**
   * 新增|编辑 品类
   * @param parameter 参数
   * @returns 布尔类型
   */
  async save(parameter: any): Promise<any> {
    Logger.log(`请求参数：${JSON.stringify(parameter)}`);
    try {
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

   /**
   * 查询所有主分类
   * @param ids id
   * @returns
   */
  async main(): Promise<any[]> {
       // 使用EntityManager构建查询
       const queryBuilder = this.entityManager.createQueryBuilder(BusinessCategoryEntity, 'category');
       const category = await queryBuilder.getMany();
       const result = category.map(t=>({
           label:t.name,
           value:t.id, 
           ...t
       }));
       return result;
 }
 /**
   * 查询主分类下的次分类
   * @param ids id
   * @returns
   */
 async getSubCategories(parentId: number): Promise<any[]> {
    const rawQuery = `
      SELECT
        category.id,
        category.category_name,
        EXISTS(SELECT 1 FROM businesscategory subCategory WHERE subCategory.parent_id = category.id) AS hasChildren
      FROM
        businesscategory category
      WHERE
        category.parent_id = ?
    `;
    const categories = await this.entityManager.query(rawQuery,[parentId]);
    return categories.map(category => ({
      label: category.category_name,
      value: category.id,
      hasChildren: category.hasChildren == 0,
    }));
  }
}
