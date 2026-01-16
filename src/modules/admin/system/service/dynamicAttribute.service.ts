import { ProductDynamicAttributeEntity } from 'src/entities/product/product_dynamic_attribute.entity';
import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Any, Brackets, EntityManager, getManager, getRepository, In, Like, Repository } from 'typeorm';
import { PageListVo } from 'src/modules/common/page/pageList';
import { DynamicAttributeEntity } from 'src/entities/admin/dynamic_attribute.entity';
import { productCategoryDynamicAttributeRelationEntity } from 'src/entities/admin/product_category_dynamic_attribute_relation.entity';
import { DynamicAttributeValueEntity } from 'src/entities/admin/dynamic_attribute_value.entity';

@Injectable()
export class DynamicAttributeService {
  // 使用InjectRespository装饰器并引入Repository这样就可以使用typeorm的操作了
  constructor(
    @InjectRepository(DynamicAttributeEntity)
    private readonly dynamicAttributeRepository: Repository<DynamicAttributeEntity>,
   

    @InjectRepository(productCategoryDynamicAttributeRelationEntity)
    private readonly productCategoryDynamicAttributeRepository: Repository<productCategoryDynamicAttributeRelationEntity>,
    @InjectEntityManager()
    private readonly dynamicAttributeManager: EntityManager,

    @InjectRepository(ProductDynamicAttributeEntity)
    private readonly productDynamicAttributeRepository: Repository<ProductDynamicAttributeEntity>,

    @InjectRepository(DynamicAttributeValueEntity)
    private readonly dynamicAttributeValueRepository: Repository<DynamicAttributeValueEntity>,
  ) {}

  /**
   *  属性列表
   * @param parameter 查询条件
   * @returns list
   */
  async pageQuery(parameter: any): Promise<PageListVo> {
     try {
          const [pageIndex, pageSize] = [parameter.page, parameter.size];
          if (parameter.categoryId && parameter.type === 'remove'){
          let qb = await this.dynamicAttributeRepository.createQueryBuilder('attr')
            .innerJoinAndSelect(
              productCategoryDynamicAttributeRelationEntity,
              'relation',
              'relation.dynamic_attribute_id=attr.id',
            )
            .where(
              new Brackets((qb) => {
                if (parameter.attributeName) {
                  return qb.where(
                    'attr.attributeName LIKE :attributeName',
                    {
                       attributeName: `%${parameter.attributeName}%`,
                    },
                  );
                } else {
                  return qb;
                }
              }),
            )
            .andWhere(
                new Brackets((qb) => {
                  if (parameter.categoryId && parameter.type === 'remove') {
                    return qb.where('relation.product_category_id=:categoryId', {
                        categoryId: parameter.categoryId,
                      });
                  } else {
                    return qb;
                  }
                }),
              )
            .orderBy(`attr.${parameter.sort}`, 'DESC')
            .skip((pageIndex - 1) * Number(pageSize))
            .take(pageSize);
    
          const [data, count] = await qb.getManyAndCount();
    
          return {
            ...{ content: data },
            page: pageIndex,
            size: pageSize,
            totalElements: count,
            totalPage: Math.ceil(count / pageSize),
          };
        }else{
            let qb = await this.dynamicAttributeRepository.createQueryBuilder('attr')
            .leftJoinAndMapMany('attr.attrValue',DynamicAttributeValueEntity,'attrV','attr.id=attrV.attribute_id')
            .where(
              new Brackets((qb) => {
                if (parameter.attributeName) {
                  return qb.where(
                    'attr.attributeName LIKE :attributeName',
                    {
                       attributeName: `%${parameter.attributeName}%`,
                    },
                  );
                } else {
                  return qb;
                }
              }),
            )
            .orderBy(`attr.${parameter.sort}`, 'DESC')
            .skip((pageIndex - 1) * Number(pageSize))
            .take(pageSize);
    
          const [data, count] = await qb.getManyAndCount();
    
          return {
            ...{ content: data },
            page: pageIndex,
            size: pageSize,
            totalElements: count,
            totalPage: Math.ceil(count / pageSize),
          };
        }
        } catch (error) {
          Logger.error(`查询用户分页列表失败，原因：${JSON.stringify(error)}`);
        }
  }

  /**
   * 新增|编辑 属性
   * @param parameter 参数
   * @returns 布尔类型
   */
  async save(parameter: any): Promise<any> {
    Logger.log(`请求参数：${JSON.stringify(parameter)}`);
    try {
      if (!parameter.id) {
        const { attributeName } = parameter;
        const existUser = await this.dynamicAttributeRepository.exist({
          where: { attributeName },
        });
        if (existUser) {
          return '属性已存在';
        }
      }
      // 必须用save 更新时间才生效
      let res = await this.dynamicAttributeRepository.save(parameter);
      if (res.id > 0) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      Logger.error(`【新增|编辑】属性请求失败：${JSON.stringify(error)}`);
    }
  }


  /**
   * 批量删除
   * @param ids id
   * @returns
   */
  async delete(ids: any): Promise<boolean> {
    Logger.log(`【批量删除属性】请求参数：${JSON.stringify(ids)}`);
        return this.dynamicAttributeManager.transaction(async (transactionalEntityManager) => {
            try {

               const dynamicAttributeValueEntity = await transactionalEntityManager.find(DynamicAttributeValueEntity,{
                  where:{
                    attributeId:In(ids)
                  }
               });

               const dynamicAttributeValueIds = dynamicAttributeValueEntity.map(entity=>entity.id);
            
                 // 检查产品属性值表是否存在记录
                const existingProductDynamicAttribute = await transactionalEntityManager.find(ProductDynamicAttributeEntity,{
                    where: {
                            attributeValueId: In(dynamicAttributeValueIds),
                    }});
                    if(existingProductDynamicAttribute.length>0){
                        throw new Error('无法删除属性，因为产品属性表中存在相关数据');
                    }    

                // 删除属性值
                await transactionalEntityManager.getRepository(DynamicAttributeValueEntity).delete({ attributeId: In(ids) });
                // 删除属性
                await transactionalEntityManager.getRepository(DynamicAttributeEntity).delete(ids);
                Logger.log(`【批量删除属性】请求参数：${JSON.stringify(ids)}`);
                return true;
            }
            catch (error) {
                Logger.log(`【批量删除属性】请求失败：${error}`);
                return false;
           }
        })
  }

  /**
   * 移除分类关联属性以及属性关联分类关系
   * @param parameters 
   * @returns 
   */
  async batchRemove(parameters:any):Promise<boolean>{    
       try{

          Logger.log('RelationAttrOrCategoryDto',parameters)
           // 分类移除多个属性  
          if(parameters.attributeIds && parameters.attributeIds.length>0){
                // 根据分类ID查询关联表中属性ID
                const DynamicAttributeValueEntity = await this.dynamicAttributeValueRepository.find({
                    where:{
                      attributeId:In(parameters.attributeIds)
                    }
                 })

                 Logger.log('DynamicAttributeValueEntity===============',Array.isArray(DynamicAttributeValueEntity))
                         
                  // 查询产品数据表中是否存在相同数据  
                 const productDynamicAttributeEntity = await this.productDynamicAttributeRepository.find({
                          where:{
                              attributeValueId:In(DynamicAttributeValueEntity.map(t=>t.id))
                          }
                 });
        
                  if(productDynamicAttributeEntity.length>0){
                       throw new Error('无法删除属性，因为产品属性表中存在相关数据');
                  }  
                  // 执行批量删除
            const result = await this.productCategoryDynamicAttributeRepository
            .createQueryBuilder()  
            .delete()
            .from(productCategoryDynamicAttributeRelationEntity)
            .where('product_category_id= :categoryId', { categoryId:parameters.categoryId })
            .andWhere('dynamic_attribute_id IN (:...attributeId)', {attributeId: parameters.attributeIds })
            .execute();
            return result.affected>0 ? true : false;
          }else{
              // 属性移除多个分类
              const dynamicAttributeEntity = await this.dynamicAttributeRepository.find({
                where:{
                  id:parameters.attributeId
                }
             })
                     
              // 查询产品数据表中是否存在相同数据  
             const productDynamicAttributeEntity = await this.productDynamicAttributeRepository.find({
                      where:{
                          attributeValueId:In(dynamicAttributeEntity.map(t=>t.id))
                      }
             });
  
              if(productDynamicAttributeEntity.length>0){
                   throw new Error('无法删除属性，因为产品属性表中存在相关数据');
              }  

            // 执行批量删除
            const result = await this.productCategoryDynamicAttributeRepository
            .createQueryBuilder()
            .delete()
            .from(productCategoryDynamicAttributeRelationEntity)
            .where('dynamic_attribute_id = :attributeId', { attributeId:parameters.attributeId })
            .andWhere('product_category_id IN (:...categories)', {categories: parameters.categories })
            .execute();
            Logger.log('result',JSON.stringify(result));
            return result.affected>0 ? true : false;
          }
       }catch(error){
          Logger.error('操作失败，原因：'+error)
       }
  }
  
    /**
     * 保存属性关联的产品分类
     * @param parameter userId roles
     * @returns 返回成功与失败
     */
    async relevanceProductCategory(parameter: any): Promise<string> {
  
      const res = await this.dynamicAttributeManager.transaction(
        async (transactionalEntityManager) => {
        
          // 批量关联分类关系
        const batchRelationsCategory = parameter.categories && parameter.categories.map((categoryId) => ({
                  dynamicAttributeId: parameter.attributeId,
                 productCategoryId: categoryId,
        }));
        if(batchRelationsCategory && batchRelationsCategory.length>0){
            // 插入新的关联关系
            for (const relation of batchRelationsCategory) {

                // 删除旧的关联关系
                await transactionalEntityManager.delete(productCategoryDynamicAttributeRelationEntity, {
                    dynamicAttributeId: parameter.attributeId,
                    productCategoryId: relation.productCategoryId,
                });

                Logger.log('检查是否已经存在相同的记录===',relation)

                // 检查是否已经存在相同的记录
                const existingRelation = await transactionalEntityManager.find(productCategoryDynamicAttributeRelationEntity,{
                    where: {
                       dynamicAttributeId: relation.dynamicAttributeId,
                       productCategoryId: relation.productCategoryId,
                    },
                });
                Logger.log('检查是否已经存在相同的记录===existingRelation',existingRelation)
        
                // 如果不存在相同的记录，则插入新记录
                if (existingRelation.length===0) {
                     await transactionalEntityManager.save(productCategoryDynamicAttributeRelationEntity, relation);
                }else{
                    Logger.log('== 已存在此关联 ==')
                    throw new Error('已存在此关联')
                }
            }  
            return batchRelationsCategory;
        }else{
                // 批量关联动态属性关系
                const batchRelationsAttribute = parameter.ids && parameter.ids.map((attributeId) => ({
                    dynamicAttributeId: attributeId,
                    productCategoryId: parameter.categoryId,
                }));
                // 插入新的关联关系
                for (const relation of batchRelationsAttribute) {

                    // 删除旧的关联关系
                    await transactionalEntityManager.delete(productCategoryDynamicAttributeRelationEntity, {
                        dynamicAttributeId: relation.dynamicAttributeId,
                        productCategoryId: parameter.categoryId,
                    });

                    // 检查是否已经存在相同的记录
                    const existingRelation = await transactionalEntityManager.find(
                        productCategoryDynamicAttributeRelationEntity,{
                            where: {
                                dynamicAttributeId: relation.dynamicAttributeId,
                                productCategoryId: parameter.categoryId,
                            },
                        });

                        Logger.log('existingRelation=====',existingRelation.length)

                    if (existingRelation.length>0) {
                        Logger.log('== 已存在此关联 ==')
                        return '已存在此关联'
                    }else{
                        // 如果不存在相同的记录，则插入新记录
                        await transactionalEntityManager.save(productCategoryDynamicAttributeRelationEntity, relation);
                    }
                }
               return batchRelationsAttribute;
           }
        });
      if (!res) return '动态属性关联产品分类失败';
      return;
    }


async getDynamicAttributeByCategoryId(parameter: any): Promise<any> {
    try {
        Logger.log('parameter.categoryId', parameter.categoryId);

        if (!parameter.categoryId) {
            throw new Error('参数错误！');
        } else {
            // 根据末级分类ID查询产品分类动态属性关联表实体
            const productCategoryDynamicAttributeRelationEntity = await this.productCategoryDynamicAttributeRepository.find({
                where: { productCategoryId: parameter.categoryId }
            });

            // 转换动态属性ID数组
            const attributeIds = productCategoryDynamicAttributeRelationEntity.map(t => t.dynamicAttributeId);

            // 根据attributeIds查询动态属性实体
            const dynamicAttributeEntity = await this.dynamicAttributeRepository.find({
                where: { id: In(attributeIds) }
            });

            Logger.log('dynamicAttributeEntity=====', dynamicAttributeEntity);

            // 定义递归查询子级属性值的函数
            const getSubValues = async (valueId: number): Promise<any[]> => {
                const subValues = await this.dynamicAttributeValueRepository.find({
                    where: {
                        parent_id: valueId // 假设子级属性值有一个 parentId 字段指向父级属性值
                    }
                });
                // 使用 Promise.all 处理异步操作
                const children = await Promise.all(subValues.map(async (subValue) => {
                    const subChildren = subValue.children ? await getSubValues(subValue.id) : undefined;
                    const option: {
                        value: number;
                        label: string;
                        id:number;
                        children?: any[];
                    } = {
                        value: subValue.id,
                        label: subValue.label,
                        id:subValue.id, 
                        // children:subValue.children,
                    };
                    if (subChildren && subChildren.length > 0) {
                        option.children = subChildren;
                    }
                    return option;
                }));

                return children;
            };

            // 遍历每个动态属性实体，查询其对应的属性值
            for (const entity of dynamicAttributeEntity) {
                const values = await this.dynamicAttributeValueRepository.find({
                    where: {
                        attributeId: entity.id
                    }
                });

                // 为每个属性值查询子级属性值
                for (const value of values) {
                    value.children = await getSubValues(value.id);
                }

                // 将查询到的属性值存储到 entity 的 values 属性中
                entity.values = values.filter(value => value.parent_id === 0)
            }
            // 返回原始的 dynamicAttributeEntity 数据，但 values 已经转换为级联选择器的格式
            return dynamicAttributeEntity;
        }
    } catch (error) {
        Logger.error('查询数据失败：' + error);
        throw new Error('查询数据失败：' + error.message);
    }
}
}
