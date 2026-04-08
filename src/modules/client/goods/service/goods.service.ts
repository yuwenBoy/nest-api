import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { ProductEntity } from 'src/entities/product/product.entity';
import { ProductDynamicAttributeEntity } from 'src/entities/product/product_dynamic_attribute.entity';
import { DynamicAttributeEntity } from 'src/entities/admin/dynamic_attribute.entity';
import { DynamicAttributeValueEntity } from 'src/entities/admin/dynamic_attribute_value.entity';
import { productCategoryDynamicAttributeRelationEntity } from 'src/entities/admin/product_category_dynamic_attribute_relation.entity';

@Injectable()
export class GoodsService {
  constructor(
    @InjectRepository(ProductEntity)
    private productRepo: Repository<ProductEntity>,
    @InjectRepository(ProductDynamicAttributeEntity)
    private productDynamicAttributeRepo: Repository<ProductDynamicAttributeEntity>,
    @InjectRepository(DynamicAttributeEntity)
    private dynamicAttributeRepo: Repository<DynamicAttributeEntity>,
    @InjectRepository(DynamicAttributeValueEntity)
    private dynamicAttributeValueRepo: Repository<DynamicAttributeValueEntity>,
    @InjectRepository(productCategoryDynamicAttributeRelationEntity)
    private categoryAttributeRelationRepo: Repository<productCategoryDynamicAttributeRelationEntity>,
  ) {}

  /**
   * 获取商品详情
   */
  async detail(id: number) {
    // 1. 获取商品基本信息
    const product = await this.productRepo.findOne({
      where: { id },
    });

    if (!product) {
      throw new Error('商品不存在');
    }

    // 2. 根据商品分类获取该分类的动态属性定义
    const categoryAttributes = await this.getCategoryAttributes(product.categoryId);

    // 3. 获取该商品的动态属性值
    const productAttributes = await this.getProductAttributes(id);

    // 4. 组装返回数据
    return {
      basicInfo: {
        id: product.id,
        productName: product.productName,
        description: product.description,
        imageUrl: product.imageUrl,
        storeId: product.storeId,
        categoryId: product.categoryId,
        status: product.status,
        isActive: product.isActive,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      },
      dynamicAttributes: categoryAttributes.map(attr => {
        const productAttr = productAttributes.find(p => p.attributeId === attr.id);
        return {
          id: attr.id,
          attributeName: attr.attributeName,
          attributeType: attr.attributeType,
          isRequired: attr.isRequired,
          isStar: attr.isStar,
          description: attr.description,
          values: attr.values || [],
          value: productAttr ? productAttr.attributeValueId : null,
        };
      }),
    };
  }

  /**
   * 根据分类ID获取该分类的动态属性定义
   */
  private async getCategoryAttributes(categoryId: number) {
    // 1. 获取该分类关联的动态属性ID
    const relations = await this.categoryAttributeRelationRepo.find({
      where: { productCategoryId: categoryId },
    });

    const attributeIds = relations.map(r => r.dynamicAttributeId);

    if (attributeIds.length === 0) {
      return [];
    }

    // 2. 获取动态属性定义
    const attributes = await this.dynamicAttributeRepo
      .createQueryBuilder('attr')
      .where('attr.id IN (:...attributeIds)', { attributeIds })
      .getMany();

    // 3. 为每个属性获取对应的属性值
    for (const attr of attributes) {
      const values = await this.dynamicAttributeValueRepo.find({
        where: { attributeId: attr.id },
        order: { sort: 'ASC' },
      });

      // 如果是级联类型，需要构建树形结构
      if (attr.attributeType === 3) {
        attr.values = this.buildAttributeTree(values);
      } else {
        attr.values = values;
      }
    }

    return attributes;
  }

  /**
   * 获取商品的动态属性值
   */
  private async getProductAttributes(productId: number) {
    const productAttributes = await this.productDynamicAttributeRepo.find({
      where: { productId },
    });

    return productAttributes;
  }

  /**
   * 构建属性值树形结构（用于级联类型）
   */
  private buildAttributeTree(values: DynamicAttributeValueEntity[]): any[] {
    const map = new Map();
    const roots = [];

    // 创建映射
    values.forEach(item => {
      map.set(item.id, { ...item, children: [] });
    });

    // 构建树形结构
    values.forEach(item => {
      const node = map.get(item.id);
      if (item.parent_id === 0) {
        roots.push(node);
      } else {
        const parent = map.get(item.parent_id);
        if (parent) {
          parent.children.push(node);
        }
      }
    });

    return roots;
  }
}
