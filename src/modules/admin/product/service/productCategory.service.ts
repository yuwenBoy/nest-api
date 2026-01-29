import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { productCategoryDynamicAttributeRelationEntity } from 'src/entities/admin/product_category_dynamic_attribute_relation.entity';
import { ProductCategoryEntity } from 'src/entities/product/product_category.entity';
import { PageListVo } from 'src/modules/common/page/pageList';
import { toTableTree } from 'src/utils';
import { Brackets, EntityManager, getRepository, Repository } from 'typeorm';

@Injectable()
export class ProductCategoryService {
  constructor(
    @InjectRepository(ProductCategoryEntity)
    private readonly  productCategoryRepository: Repository<ProductCategoryEntity>,

    @InjectRepository(productCategoryDynamicAttributeRelationEntity)
    private readonly  productCategoryDynamicAttributeRepository: Repository<productCategoryDynamicAttributeRelationEntity>,
    @InjectEntityManager()
    private entityManager: EntityManager,
  ) {}


 
  /**
   * 查询品类列表
   * @param parameter 查询条件
   * @returns list
   */
  async pageProductCategoryList(params): Promise<any> {
    try {
      let queryBuilder = await this.productCategoryRepository.createQueryBuilder('cate')
      let data = await queryBuilder.getMany();  
      return {
        content:toTableTree(data, 0)
      }
    } catch (error) {
      Logger.error(`品类列表请求失败,原因：${JSON.stringify(error)}`);
    }
  }

    /**
   * 查询全部品类转换成树形结构
   */
    async getCategoryAll(): Promise<any> {      
        try {
          return await this.productCategoryRepository
            .createQueryBuilder('dept')
            .select([
              'id',
              'name AS label',
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
      if(parameter.parent_id){
        const parent = await this.productCategoryRepository.findOne({ where: { id: parameter.parent_id } });
        Logger.log('parent====================',JSON.stringify(parent));
        if (!parent) {
            throw new Error('Parent category not found');
        }

        parameter.level = parent.level + 1; // 父分类的层级加1    
      }
      let res = await this.productCategoryRepository.save(parameter);
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
      let a = await this.productCategoryRepository.delete(ids);
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
       const queryBuilder = this.entityManager.createQueryBuilder(ProductCategoryEntity, 'category');
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
        category.name,
        EXISTS(SELECT 1 FROM product_category subCategory WHERE subCategory.parent_id = category.id) AS hasChildren
      FROM
        product_category category
      WHERE
        category.parent_id = ?
    `;
    const categories = await this.entityManager.query(rawQuery,[parentId]);
    return categories.map(category => ({
      label: category.name,
      value: category.id,
      hasChildren: category.hasChildren == 0,
    }));
  }

  
    /**
   *  属性关联产品分类列表
   * @param parameter 查询条件
   * @returns list
   */
    async relevancePageQuery(parameter: any): Promise<PageListVo> {
        try {
             const [pageIndex, pageSize] = [parameter.page, parameter.size];
                  let qb = await this.productCategoryDynamicAttributeRepository
                    .createQueryBuilder('pcrelation')
                    .innerJoinAndMapOne(
                      'pcrelation.product_category',
                       ProductCategoryEntity,
                      'pc',
                      'pc.id=pcrelation.product_category_id',
                    );
                     // 添加查询条件
            if (parameter.dynamicAttributeId) {
                qb = qb.where('pcrelation.dynamic_attribute_id = :dynamicAttributeId', {
                    dynamicAttributeId: parameter.dynamicAttributeId,
                });
            }
  
      // 添加排序条件
      qb = qb.orderBy(`pc.${parameter.sort}`, 'DESC');
      // 分页
      qb = qb.skip((pageIndex - 1) * Number(pageSize)).take(pageSize);
  
      // 执行查询
      const [data, count] = await qb.getManyAndCount();
            
            
                  return {
                    ...{ content: data },
                    page: pageIndex,
                    size: pageSize,
                    totalElements: count,
                    totalPage: Math.ceil(count / pageSize),
                  };
        } catch (error) {
          Logger.log(`查询【属性关联产品分类列表】请求失败：${error}`);
        }
      }
}
