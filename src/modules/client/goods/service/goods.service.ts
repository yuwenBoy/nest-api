import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { Connection, In, MoreThan, Repository } from 'typeorm';
import { ProductEntity } from 'src/entities/product/product.entity';
import { ProductDynamicAttributeEntity } from 'src/entities/product/product_dynamic_attribute.entity';
import { DynamicAttributeEntity } from 'src/entities/admin/dynamic_attribute.entity';
import { DynamicAttributeValueEntity } from 'src/entities/admin/dynamic_attribute_value.entity';
import { productCategoryDynamicAttributeRelationEntity } from 'src/entities/admin/product_category_dynamic_attribute_relation.entity';
import { ProductSpecEntity } from 'src/entities/product/product_spec.entity';
import { ProductSpecAttrRelationEntity } from 'src/entities/product/product_spec_attr_relation.entity';
import { attributeTypeEnum } from 'src/enum/admin_enum';

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
    @InjectRepository(ProductSpecEntity)
    private productSpecRepo: Repository<ProductSpecEntity>,
    @InjectRepository(ProductSpecAttrRelationEntity)
    private productSpecAttrRelationRepo: Repository<ProductSpecAttrRelationEntity>,
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

    // 4. 获取商品规格
    const productSpecs = await this.getProductSpecs(id);

    // 5. 组装返回数据
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
        // 对于多选类型，获取所有匹配的值
        if (attr.attributeType === attributeTypeEnum.BATCHSELECT) {
          const productAttrs = productAttributes.filter(p => p.attributeId === attr.id);
          const values = productAttrs.map(p => {
            // 查找对应的显示值
            const valueObj = this.findAttributeValue(attr.values, p.attributeValueId);
            return {
              id: p.attributeValueId,
              value: valueObj ? valueObj.value : null
            };
          });
          return {
            id: attr.id,
            attributeName: attr.attributeName,
            attributeType: attr.attributeType,
            isRequired: attr.isRequired,
            isStar: attr.isStar,
            description: attr.description,
            values: attr.values || [],
            value: values,
          };
        } else if (attr.attributeType === attributeTypeEnum.SELECT || attr.attributeType === attributeTypeEnum.CASCADER) {
          // 对于单选和级联类型，获取匹配的值
          const productAttr = productAttributes.find(p => p.attributeId === attr.id);
          if (productAttr) {
            // 查找对应的显示值
            const valueObj = this.findAttributeValue(attr.values, productAttr.attributeValueId);
            return {
              id: attr.id,
              attributeName: attr.attributeName,
              attributeType: attr.attributeType,
              isRequired: attr.isRequired,
              isStar: attr.isStar,
              description: attr.description,
              values: attr.values || [],
              value: {
                id: productAttr.attributeValueId,
                value: valueObj ? valueObj.value : null
              },
            };
          } else {
            return {
              id: attr.id,
              attributeName: attr.attributeName,
              attributeType: attr.attributeType,
              isRequired: attr.isRequired,
              isStar: attr.isStar,
              description: attr.description,
              values: attr.values || [],
              value: null,
            };
          }
        } else {
          // 对于其他类型，只获取第一个匹配的值
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
        }
      }),
      productSpecs: productSpecs,
    };
  }

  /**
   * 获取商品的规格信息
   */
  private async getProductSpecs(productId: number) {
    // 1. 查询商品规格
    const specs = await this.productSpecRepo.find({
      where: {
        productId,
        stock: MoreThan(0),
      },
      select: ['id', 'productId', 'name', 'price', 'stock'],
    });

    if (!specs.length) {
      return [];
    }

    const specIds = specs.map((s) => s.id);

    // 2. 查询规格属性关联
    const relations = await this.productSpecAttrRelationRepo.find({
      where: { productSpecId: In(specIds) },
    });

    // 3. 按 productSpecId 收集属性，使用 Map 去重
    const specAttrMap = new Map<number, Map<string, any>>();

    for (const r of relations) {
      let attrList = r.attributeOptionJson;

      if (typeof attrList === 'string') {
        try {
          attrList = JSON.parse(attrList);
        } catch (e) {
          attrList = [];
        }
      }

      if (!Array.isArray(attrList)) {
        attrList = attrList ? [attrList] : [];
      }

      if (!specAttrMap.has(r.productSpecId)) {
        specAttrMap.set(r.productSpecId, new Map());
      }
      const attrDedupMap = specAttrMap.get(r.productSpecId);

      for (const attr of attrList) {
        const attrId = attr.productSpecAttrId || attr.attrId;
        const optionId = attr.id || attr.optionId;
        const dedupKey = `${attrId}_${optionId}`;

        if (!attrDedupMap.has(dedupKey)) {
          attrDedupMap.set(dedupKey, {
            attrId: attrId,
            attrName: attr.name || attr.attrName || '',
            optionId: optionId,
            optionName: attr.name || attr.optionName || '',
            saleStatus: attr.saleStatus,
          });
        }
      }
    }

    // 4. 转换回数组
    const finalSpecAttrMap = new Map<number, any[]>();
    specAttrMap.forEach((dedupMap, specId) => {
      finalSpecAttrMap.set(specId, Array.from(dedupMap.values()));
    });

    // 5. 组装规格数据
    const specList = specs.map((spec) => {
      const attrs = finalSpecAttrMap.get(spec.id) || [];

      return {
        specId: spec.id,
        specName: spec.name,
        price: spec.price,
        stock: spec.stock,
        attrs: attrs,
      };
    });

    return specList;
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

      // 对于级联类型、多选类型或单选类型，都需要构建树形结构
      if (attr.attributeType === attributeTypeEnum.CASCADER || 
          attr.attributeType === attributeTypeEnum.BATCHSELECT || 
          attr.attributeType === attributeTypeEnum.SELECT) {
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

  /**
   * 递归查找属性值
   */
  private findAttributeValue(values: any[], valueId: string): any {
    for (const item of values) {
      if (item.id == valueId) {
        return item;
      }
      if (item.children && item.children.length > 0) {
        const found = this.findAttributeValue(item.children, valueId);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }
}
