import { Injectable, Logger } from '@nestjs/common';
import { And, Any, Brackets, In, Like, Repository } from 'typeorm';
import { DynamicAttributeValueEntity } from '../../../../entities/admin/dynamic_attribute_value.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { toTableTree } from '../../../../utils';
import { ProductDynamicAttributeEntity } from '../../../../entities/product/product_dynamic_attribute.entity';

@Injectable()
export class DynamicAttributeValueService {
  // 使用InjectRespository装饰器并引入Repository这样就可以使用typeorm的操作了
  constructor(
    @InjectRepository(DynamicAttributeValueEntity)
    private readonly dynamicAttributeValueRepository: Repository<DynamicAttributeValueEntity>,

    @InjectRepository(ProductDynamicAttributeEntity)
    private readonly productDynamicAttributeRepository: Repository<ProductDynamicAttributeEntity>,

  ) {}

  /**
   *  属性值列表
   * @param parameter 查询条件
   * @returns list
   */
  async pageQuery(parameter: any): Promise<any> {
    try {
    let queryBuilder = await this.dynamicAttributeValueRepository.createQueryBuilder('cate');
   
    if (parameter.attributeId) {
        queryBuilder.where('cate.attribute_id=:attribute_id', { attribute_id:parameter.attributeId });
    }
    if (parameter.value) {
        queryBuilder.andWhere('cate.value LIKE :value', { value: `%${parameter.value.trim()}%` });
    }
    if (parameter.sort){
        queryBuilder.orderBy(`cate.${parameter.sort}`, 'DESC');
    }
    queryBuilder.addOrderBy('cate.created_at','DESC');
    let data = await queryBuilder.getMany();  
    let result = {
      content: parameter.value ? data : toTableTree(data, 0),  
    };
    return {  
      ...result  
    };
        } catch (error) {
          Logger.log(`查询【属性值分页列表】请求失败：${JSON.stringify(error)}`);
        }
  }

  /**
   * 新增|编辑 属性值
   * @param parameter 参数
   * @returns 布尔类型
   */
  async save(parameter: any): Promise<any> {
    Logger.log(`请求参数：${JSON.stringify(parameter)}`);
    try {
      // 必须用save 更新时间才生效
      let res = await this.dynamicAttributeValueRepository.save(parameter);
      if (res.id > 0) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      Logger.error(`【新增|编辑】属性值请求失败：${JSON.stringify(error)}`);
    }
  }

  /**
   * 批量删除
   * @param ids id
   * @returns
   */
  async delete(ids: any): Promise<any> {
    Logger.log(`【批量删除属性值】请求参数：${JSON.stringify(ids)}`);
    try {

      // 查询产品数据表中是否存在相同数据  
      const productDynamicAttributeEntity = await this.productDynamicAttributeRepository.find({
        where:{
            attributeValueId:In(ids)
        }
      });
      if(productDynamicAttributeEntity.length>0){
         throw new Error('无法删除属性，因为产品属性表中存在相关数据');
      }  
      let a = await this.dynamicAttributeValueRepository.delete(ids);
      Logger.log(`【批量删除属性值】删除返回数据：${JSON.stringify(a)}`);
      if (a.affected == 0) {
        return false;
      } else {
        return true;
      }
    } catch (error) {
      Logger.log(`【批量删除属性值】请求失败：${JSON.stringify(error)}`);
      return false;
    }
  }

    /**
   * 查询全部品类转换成树形结构
   */
    async getCategoryAll(attributeId): Promise<any> {      
        try {
          return await this.dynamicAttributeValueRepository
            .createQueryBuilder('dept')
            .select([
              'id',
              'value AS label',
              'parent_id',
            ])
            .where('dept.attribute_id=:attributeId',{attributeId})
            .getRawMany();
        } catch (error) {
          Logger.error('查询品类失败，原因：' + error);
        }
      }
}
