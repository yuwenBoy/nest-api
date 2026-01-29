import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Brackets, EntityManager, In, Repository } from 'typeorm';
import { ProductEntity } from 'src/entities/product/product.entity';
import { SaveProductDto } from '../dto/CreateProductDto';
import { ProductAuditStatusEnum, ProductSaleStatusEnum } from 'src/enum/business_enum';
import { ProductGroupRelationEntity } from 'src/entities/product/product_group_relation.entity';
import { ProductCategoryRelationEntity } from 'src/entities/product/product_category_relation.entity';
import { ProductCategoryEntity } from 'src/entities/product/product_category.entity';
import { ProductDynamicAttributeEntity } from 'src/entities/product/product_dynamic_attribute.entity';
import { ProductSpecAttrEntity } from 'src/entities/product/product_spec_attr.entity';
import { ProductSpecEntity } from 'src/entities/product/product_spec.entity';
import { ProductSpecAttrOptionEntity } from 'src/entities/product/product_spec_attrOption.entity';
import { ProductSpecAttrRelationEntity } from 'src/entities/product/product_spec_attr_relation.entity';
import { DynamicAttributeValueEntity } from 'src/entities/admin/dynamic_attribute_value.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    
    @InjectRepository(ProductSpecEntity)
    private readonly productSpecRepository: Repository<ProductSpecEntity>,

    @InjectRepository(ProductCategoryRelationEntity)
    private readonly productCategoryRepository: Repository<ProductCategoryRelationEntity>,


    @InjectRepository(ProductDynamicAttributeEntity)
    private readonly productDynamicAttributeRepository: Repository<ProductDynamicAttributeEntity>,

    
    @InjectRepository(DynamicAttributeValueEntity)
    private readonly productDynamicAttributeValueRepository: Repository<DynamicAttributeValueEntity>,

    @InjectRepository(ProductSpecAttrRelationEntity)
    private readonly productSpecAttrRelationRepository: Repository<ProductSpecAttrRelationEntity>,

    @InjectRepository(ProductSpecAttrEntity)
    private readonly productSpecAttrRepository: Repository<ProductSpecAttrEntity>,

    @InjectRepository(ProductSpecAttrOptionEntity)
    private readonly productSpecAttrOptionRepository: Repository<ProductSpecAttrOptionEntity>,
   
  ) {}


/**
 * 根据产品ID查询关联属性集合
 * @param productId 产品ID
 * @returns 
 */
  async getPropertyInfo(productId:number):Promise<any>{
    const productProperties = await this.productSpecAttrRelationRepository.find({where:{productId}});
    // 提取所有唯一的属性值 ID
    const uniqueAttrValueIds = new Set<number>();
    productProperties.forEach(spec => {
      try {
            let propertyOptionList;
            try {
                if(spec.attributeOptionJson && typeof spec.attributeOptionJson === 'string') {
                     propertyOptionList = JSON.parse(spec.attributeOptionJson);
                }else{
                     propertyOptionList = spec.attributeOptionJson
                }
                if(propertyOptionList && propertyOptionList.length>0){
                    propertyOptionList.forEach(item =>{
                        // 确保 id 是有效的数字字符串
                        const parsedId = parseInt(item.id, 10);
                        if (!isNaN(parsedId)) {
                            uniqueAttrValueIds.add(parsedId);
                        }
                    });
                }
            } catch (error) {
                Logger.error('Invalid JSON format', spec.attributeOptionJson);
            }
      } catch (error) {
           Logger.error(error)
      }
    });

    // 根据选项ID查询选项实体
    const attrOptionEntity = await this.productSpecAttrOptionRepository.find({
        where: { id: In(Array.from(uniqueAttrValueIds)) }
    })
    // 查询所有相关的属性
    const specAttrs = await this.productSpecAttrRepository.find({
        where: { id:In(attrOptionEntity.map(t=>t.productSpecAttrId) )}
    });

    // 查询所有相关的属性详情
    const specAttrDetails = await this.productSpecAttrOptionRepository.find({
        where: { id:In(Array.from(uniqueAttrValueIds)) }
    });

    // 构建属性映射表
    const propertyMap: { [key: number]: any } = {};
    specAttrs.forEach(attr => {
        propertyMap[attr.id] = {
            id: attr.id,
            name: attr.name,
            sort: attr.sort,
            details: [],
            createdAt: attr.createdAt.toISOString(),
            updatedAt: attr.updatedAt.toISOString(),
            businessId: attr.businessId
        };
    });

    // 构建属性详情
    specAttrDetails.forEach(detail => {
        if (propertyMap[detail.productSpecAttrId]) {
            propertyMap[detail.productSpecAttrId].details.push({
                id: detail.id,
                name: detail.name,
                saleStatus:detail.saleStatus,
            });
        }
    });

    // 构建最终的 properties 数组
    const properties = Object.values(propertyMap);
    return properties
  }

  /**
   * 根据产品id获取产品信息
   * @returns 
   */
  async detail(productId:number):Promise<any>{
    try{
         const productEntity = await this.productRepository.findOne({where:{id:productId}});
         const product_spea = await this.productSpecRepository.find({where:{productId}});
 
         const categories = (await this.productCategoryRepository.find({where:{productId}})).map(y=>y.productCategoryId);
         const productDynamicEntity = await this.productDynamicAttributeRepository.find({where:{productId}});

         // 查询每个attributeValueId对应的parentId
        const productDynamicWithParentIds = await Promise.all(
             productDynamicEntity.map(async (item) => {
            if (Number(item.attributeValueId)) {
                const attributeValue = await this.productDynamicAttributeValueRepository.findOne({ where: { id: Number(item.attributeValueId) } });
                return {
                ...item, // 保留原始对象的其他属性
                parentId: attributeValue.parent_id, // 添加parentId
                attributeValueId: item.attributeValueId // 确保attributeValueId仍然存在
                };
            }
            return item; // 如果attributeValueId无效，保留原始对象
         }));
  
        // 根据attributeId分组，并在每个分组内根据parentId是否为0调整顺序
        const groupedByAttributeId = productDynamicWithParentIds.reduce((acc, item) => {
            if (!acc[item.attributeId]) {
            acc[item.attributeId] = [];
            }
            acc[item.attributeId].push(item);
            return acc;
        }, {});
  
        // 在每个分组内根据parentId是否为0调整顺序
        const sortedGroups = Object.values(groupedByAttributeId).map((group: { parentId: number; attributeValueId: number; attributeId: string }[]) => {
            return group.sort((a, b) => {
            if (a.parentId === 0) return -1; // 如果a的parentId为0，a排在前面
            if (b.parentId === 0) return 1;  // 如果b的parentId为0，b排在前面
            return 0; // 否则保持原顺序
            });
        });

  
        // 将所有分组重新合并为一个数组
        const newProductDynamic = sortedGroups.flat();
                return {
                    ...productEntity,
                    product_spea,
                    properties:await this.getPropertyInfo(productId),
                    categories,
                    newProductDynamic,
                }
        }
    catch(e){

    }
  }


  /**
   * 根据商家ID查询属性信息
   * @param businessId 商家ID
   */
  async fetchProperties(businessId:number):Promise<any>{
      try {
        if(businessId>0){
            const properties = await this.productSpecAttrRepository.find({where:{businessId}});
            interface ProductSpecAttrEntityWithDetails extends ProductSpecAttrEntity {
                details: ProductSpecAttrOptionEntity[];
            }
             const promises = properties.map(item => 
                this.productSpecAttrOptionRepository.find({
                    where: { productSpecAttrId: item.id }
                })
            );
            
            const results = await Promise.all(promises);   
            
            properties.forEach((item, index) => {
                const extendedItem = item as ProductSpecAttrEntityWithDetails;
                extendedItem.details = results[index];
            });
            return properties;
        }
      } catch (error) {
        Logger.log('根据商家ID查询属性信息失败，原因：'+error);
        return {success:false,message:'根据商家ID查询属性信息失败，原因：'+error}
      }
  }

    /**
     * 批量改分组、描述
     * @param params 
     * @param any 
     */ 
    async batchUpdateInfo(params:any):Promise<any>{
         try {
            return this.productRepository.manager.transaction(async (transactionalEntityManager) => {
                let productIds = params.productIds;
                if(params.type==1){
                    // 批量改分组
                    await transactionalEntityManager.delete(ProductGroupRelationEntity, { productId: In(productIds) });
                    for(const productId of productIds){
                        const productGroupRelation = transactionalEntityManager.create(ProductGroupRelationEntity,{
                            productId,
                            groupId:params.groupId
                        });

                         await transactionalEntityManager.save(productGroupRelation);    
                    }
                    return {success:true,message:'操作成功。'} 
                }
                else if(params.type==2){
                    if(params.description){
                        // 批量改描述
                        for(const productId of productIds){
                            const product = transactionalEntityManager.create(ProductEntity,{
                                description:params.description,
                                id:productId
                            })
                            await transactionalEntityManager.save(product);    
                        }
                    }
                  
                   return {success:true,message:'操作成功。'} 
                }
                // 批量改打包费
                else if(params.type==3){ 
                    const productSpec = await this.productSpecRepository.find({where:{
                        productId:In(productIds)
                    }})
                   for(const spec of productSpec){
                         const specEntity = transactionalEntityManager.create(ProductSpecEntity,{
                            packingPrice:params.packingPrice,
                            unitInfo:params.unitInfo,
                            id:spec.id
                         })
                         await transactionalEntityManager.save(specEntity);    
                   }
                   return {success:true,message:'操作成功。'} 
                }
                 // 批量改份量规格
                else if(params.type == 4){
                       await transactionalEntityManager.delete(ProductSpecEntity, { productId: In(productIds) });
                       if (params.product_spea.length > 0) {
                        for(const productId of productIds){
                           const productSpecEntities = params.product_spea.map(spea =>
                               transactionalEntityManager.create(ProductSpecEntity, {
                                   productId: productId,
                                   price: spea.price,
                                   weight: spea.weight,
                                   name: spea.name,
                                   unitInfo: spea.unitInfo,
                               })
                           );
                            await transactionalEntityManager.save(productSpecEntities);
                        }
                        return {success:true,message:'操作成功。'} 
                   }
                }

                // 批量改属性规格
                else if(params.type == 5){

                    const products = await transactionalEntityManager.find(ProductEntity,{
                        where:{id:In(productIds)}
                    })

                    const savedProductSpecs = await transactionalEntityManager.find(ProductSpecEntity,{
                        where:{productId:In(productIds)}
                    })

                    Logger.log('savedProductSpecs',savedProductSpecs)

                    if (params.properties.length > 0) {
                    
                        const {savedProperties,savedPropertyValues} = await this.savePropertyAndPropertieOption(transactionalEntityManager,params.properties,products[0].storeId);
                   
                    
                        // 确保 savedProductSpecs 和 savedProperties 有数据
                        if (!savedProductSpecs || savedProductSpecs.length === 0) {
                            console.error('没有产品规格数据');
                            return;
                        }
                        if (!savedProperties || savedProperties.length === 0) {
                            console.error('没有属性数据');
                            return;
                        }

                        // 通用的笛卡尔积函数
                        function cartesianProduct(arrays) {
                            return arrays.reduce((a, b) => a.flatMap(x => b.map(y => [...x, y])), [[]]);
                        }

                        // 构建需要插入的新关联记录
                        const newRelationEntities = [];
                        for(const product of products){
                            const productSpecForProduct = savedProductSpecs.filter(t=>t.productId == product.id);
                            
                             // 将属性和属性选项转换为笛卡尔积需要的格式
                            const propertyOptions = savedProperties.map(item => {
                                const propertyValues = savedPropertyValues.filter(pv => pv.productSpecAttrId === item.id);
                                return propertyValues;
                            });

                             // 计算属性选项的笛卡尔积
                            const propertyCombinations = cartesianProduct(propertyOptions);
                            
                            // 将每个规格与每个属性组合结合
                            const allCombinations = cartesianProduct([productSpecForProduct, propertyCombinations]);

                            Logger.log('=================allCombinations=================',allCombinations)
                            // 遍历所有组合，生成关联记录
                            propertyCombinations.forEach(propertyCombination => {
                                // const propertyDetails = propertyCombination.map(p => ({
                                //     id: p.id,
                                //     name: p.name
                                // }));

                                productSpecForProduct.forEach(item=>{
                                    // 创建新的关联记录
                                    const newRelation = transactionalEntityManager.create(ProductSpecAttrRelationEntity, {
                                        productId:product.id,
                                        productSpecId: item.id,
                                        attributeOptionJson: JSON.stringify(propertyCombination)
                                    });
                                    newRelationEntities.push(newRelation);
                               })
                                // console.log(`规格: ${productSpec.name} (id: ${productSpec.id}), 属性组合: ${propertyDetails.map(p => `${p.name} (id: ${p.id})`).join(', ')}`);
                            });
                        }

                        // 删除旧的关联记录
                        await transactionalEntityManager.delete(ProductSpecAttrRelationEntity, { productId: In(productIds) });
                    
                        Logger.log('newRelationEntities',newRelationEntities)
                        // 插入新的关联记录
                        if (newRelationEntities.length > 0) {
                            await transactionalEntityManager.save(newRelationEntities);
                        }
                    }    
                }
            })
         } catch (error) {
            Logger.log('批量更新失败，原因：'+error);
            return {success:false,message:'批量上下架失败，原因：'+error}
         }
}


  /***
   * 
   * 批量上下架产品信息
   */
  async updateProductInfo(params:any):Promise<any>{
     try{
       
       const products = await this.productRepository.find({where:{id:In(params.ids)}}); 
             
       products.forEach((product)=>{
        product.isActive = params.isActive;
       })
       await this.productRepository.save(products);
       return {success:true,message:'操作成功。'} 
     }


     catch(error){
        Logger.log('批量更新失败，原因：'+error);
        return {success:false,message:'批量上下架失败，原因：'+error}
     }
  }


   /**
   * 查询全部产品数量、已下架、已售罄数量
   * @returns 
   */
   async getStatistics(storeId:number){
    const products = await this.productRepository.find({where:{storeId}});
    const productCount = products.length; //商品总数
    const downActiveCount = products.filter(t=>t.isActive==2)?.length; // 已下架
    const spec = await this.productSpecRepository.find({ where: {productId:In(products.map(t=>t.id)), stock: 0 } });
    const soldOutCount = spec.length; // 已售罄
    return {
        productCount,
        downActiveCount,
        soldOutCount
    };
  }
  
  /**
   * 查询产品列表
   * @param parameter 查询条件
   * @returns list
   */
  async pageQuery(parameter: any): Promise<any> {
     try {
             const [pageIndex, pageSize] = [parameter.page, parameter.size];
                  let qb = await this.productRepository.createQueryBuilder('product')
                   .innerJoinAndMapMany(
                                    'product.group',
                                    ProductGroupRelationEntity,
                                    'pgr',
                                    'product.id=pgr.product_id',)
                    .innerJoinAndMapMany(
                        'product.specs',
                        ProductSpecEntity,
                        'pspec',
                        'product.id=pspec.product_id',)
                  .where(
                      new Brackets((qb) => {
                          if (parameter.productName) {
                            qb.andWhere('product.product_name LIKE :name', {
                                name: `%${parameter.productName}%`,
                            });
                          }
                      }),
                    ).andWhere(
                        new Brackets((qb) => {
                            if (parameter.storeId) {
                              qb.andWhere('product.store_id  = :storeId', { storeId: parameter.storeId });
                            }
                        }),
                      ).andWhere(new Brackets((qb) => {
                        if (parameter.groupId) {
                          qb.andWhere('pgr.group_id  = :groupId', { groupId: parameter.groupId });
                        }
                    }),).andWhere(new Brackets((qb) => {
                        if (parameter.isActive==2) {
                             qb.andWhere('product.is_active = :isActive', { isActive: parameter.isActive });
                        }
                    }),).andWhere(new Brackets((qb) => {
                        if (parameter.isActive==3) {
                             qb.andWhere('pspec.stock = 0');
                        }
                    }),)
                    // .orderBy(`business.created_at`, 'DESC')
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
            } catch (error) {
              Logger.error(`查询分页列表失败，原因：${JSON.stringify(error)}`);
              throw new HttpException('查询分页列表失败', HttpStatus.INTERNAL_SERVER_ERROR);
      }
  }


  /***
   * 保存产品规格属性关联关系
   */
  async saveProductSpecPropertyRelation(transactionalEntityManager,savedProductSpecs,savedProperties,savedPropertyValues,productId):Promise<any>{
        // 构建需要插入的新关联记录
        const newRelationEntities = [];
                                
        if (!savedProperties || savedProperties.length === 0) {
            console.error('没有属性数据');
            return;
        }

        // 通用的笛卡尔积函数
        function cartesianProduct(arrays) {
            return arrays.reduce((a, b) => a.flatMap(x => b.map(y => [...x, y])), [[]]);
        }

        // 将属性和属性选项转换为笛卡尔积需要的格式
        const propertyOptions =  []

        savedProperties.forEach(item=>{
            const propertyValues = savedPropertyValues.filter(pv => pv.productSpecAttrId === item.id);
            propertyOptions.push(propertyValues)
        })

        // 计算属性选项的笛卡尔积
        const propertyCombinations = cartesianProduct(propertyOptions);

        // 将每个规格与每个属性组合结合
        const allCombinations = cartesianProduct([savedProductSpecs, propertyCombinations]);

        // 遍历所有组合，生成关联记录
        allCombinations.forEach(combination => {
            const [productSpec, propertyCombination] = combination;

            // 创建新的关联记录
            const newRelation = transactionalEntityManager.create(ProductSpecAttrRelationEntity, {
                productId,
                productSpecId: productSpec.id,
                attributeOptionJson:JSON.stringify(propertyCombination) ,//propertyDetails.map(p => p.id).toString()
            });
            Logger.log('newRelation',JSON.stringify(newRelation))
            newRelationEntities.push(newRelation);
            // console.log(`规格: ${productSpec.name} (id: ${productSpec.id}), 属性组合: ${propertyDetails.map(p => `${p.name} (id: ${p.id})`).join(', ')}`);
        });

        // 删除旧的关联记录
        await transactionalEntityManager.delete(ProductSpecAttrRelationEntity, { productId});

        // 插入新的关联记录
        if (newRelationEntities.length > 0) {
            await transactionalEntityManager.save(newRelationEntities);
        }
  }


  /***
   * 新增、编辑产品处理产品规格属性、属性选项并返回
   */
  async savePropertyAndPropertieOption(transactionalEntityManager,properties,businessId):Promise<any>{
     // 创建属性实体
     const propertyEntities = properties.map((attr, index) =>
        transactionalEntityManager.create(ProductSpecAttrEntity, {
            id: attr.id,
            name: attr.name,
            sort: index + 1,
            businessId,
        })
    );

    // 检查属性是否已存在，并获取或插入属性
    const savedProperties = await Promise.all(propertyEntities.map(async (entity) => {
        if (entity.id) {
            const existingProperty = await transactionalEntityManager.findOne(ProductSpecAttrEntity, {
                where: { id: entity.id }
            });
            Logger.log('entity======',entity.name)
            Logger.log('existingProperty',existingProperty.name)
            // 如果属性存在，且属性名称相同 更新现有属性
            if (existingProperty.name !== entity.name) {
                // 如果名称发生变化，创建一个新的属性记录
                const newProperty = transactionalEntityManager.create(ProductSpecAttrEntity, {
                    name: entity.name,
                    sort: entity.sort,
                    businessId: entity.businessId,
                });
                const savedNewProperty = await transactionalEntityManager.save(newProperty);
                return savedNewProperty;
            } else {
                existingProperty.name = entity.name;
                existingProperty.sort = entity.sort;
                existingProperty.businessId = entity.businessId;
                await transactionalEntityManager.save(existingProperty);
                return existingProperty;
            }
        } else {

              Logger.log('===========新增属性============',entity)

              // 如果 id 不存在，说明是新增操作
               const newProperty = transactionalEntityManager.create(ProductSpecAttrEntity, {
                name: entity.name,
                sort: entity.sort,
                businessId: entity.businessId,
            });
            const savedNewProperty = await transactionalEntityManager.save(newProperty);
            return savedNewProperty;
        }
    }));

    // 查询数据库中已存在的属性选项
    const existingPropertyValues = await transactionalEntityManager.find(ProductSpecAttrOptionEntity, {
        where: { productSpecAttrId: In(savedProperties.map(prop => prop.id)) }
    });

    // 构建已存在的属性选项的映射
    const existingPropertyValuesMap = new Map();
    existingPropertyValues.forEach(pv => {
        existingPropertyValuesMap.set(pv.id, pv); // 根据 id 构建映射
    });

    // 插入或更新属性选项
    const savedPropertyValues = [];
    for (const [index,savedProperty] of savedProperties.entries()) {
        Logger.log('savedProperty.id',savedProperty.id)
        const attr = properties.find(p => p.id === savedProperty.id); // 根据属性 id 匹配属性
        if (attr && attr.details) {
            for (const attrValue of attr.details) {
                if (attrValue.id) {
                    // 如果 attrValue.id 存在，说明是更新操作
                    const existingAttrValue = existingPropertyValuesMap.get(attrValue.id);
                    if (existingAttrValue) {
                        // 如果属性选项存在，删除现有属性选项
                        existingAttrValue.name = attrValue.name;
                        existingAttrValue.saleStatus = attrValue.saleStatus;
                        // existingAttrValue.productSpecAttrId = attrValue.productSpecAttrId;
                       const saveAttrValue =  await transactionalEntityManager.save(existingAttrValue);
                       savedPropertyValues.push(saveAttrValue);
                        // await transactionalEntityManager.remove(existingAttrValue);
                    } else {
                        // 如果属性选项不存在，抛出错误（因为理论上应该存在）
                        throw new Error(`属性选项 id ${attrValue.id} 不存在`);
                    }
                }
                else{
                     // 创建新的属性选项
                    const newAttrValue = transactionalEntityManager.create(ProductSpecAttrOptionEntity, {
                        name: attrValue.name,
                        productSpecAttrId: savedProperty.id,
                        saleStatus: attrValue.saleStatus,
                    });
                    const savedAttrValue = await transactionalEntityManager.save(newAttrValue);
                    savedPropertyValues.push(savedAttrValue);
                }
            }
        }else{
                // 如果 attr 为 undefined 且 savedProperty.id 为 null，说明这是一个全新的属性
                // 需要插入新的属性及其选项

                Logger.log('properties',properties)
                const newAttr = properties.filter(p => p.id === null);
                // Logger.log(newAttr,'=======newAttr=====')
                // Logger.log('新增的选项123',newAttr)
                Logger.log('savedProperty======',savedProperty);
                if(newAttr.length>0){
                    for (const newAttrValue of newAttr[index].details) {
                        const newAttrValueEntity = transactionalEntityManager.create(ProductSpecAttrOptionEntity, {
                            name: newAttrValue.name,
                            productSpecAttrId: savedProperty.id,
                            saleStatus: newAttrValue.saleStatus,
                        });
                        const savedNewAttrValue = await transactionalEntityManager.save(newAttrValueEntity);
                        savedPropertyValues.push(savedNewAttrValue);
                    }
                }
        }
    }
    if (!savedProperties || savedProperties.length === 0) {
        console.error('没有属性数据');
        return;
    }
    return {savedProperties:savedProperties,savedPropertyValues:savedPropertyValues};
  }

    /**
        * 编辑产品
        * @param dto 
        * @returns 
        */
    async update(dto: SaveProductDto): Promise<any> {
        return this.productRepository.manager.transaction(async (transactionalEntityManager) => {
            try {
                 // 获取产品实体
                const product = await transactionalEntityManager.findOneOrFail(ProductEntity, {
                    where: { id: dto.id },
                });

                // 更新产品实体
                product.productName = dto.productName;
                product.description = dto.description;
                product.storeId = dto.storeId;
                product.imageUrl = dto.imageUrl.map(t => t).toString();
                product.categoryId = dto.categories[dto.categories.length - 1];
                product.status = ProductAuditStatusEnum.SUCCESS; // 默认审核通过
                product.isActive = ProductSaleStatusEnum.UPSALE;

                // 保存产品表数据
                const savedProduct = await transactionalEntityManager.save(product);

                 // 更新产品分组关联表
                await transactionalEntityManager.delete(ProductGroupRelationEntity, { productId: savedProduct.id });
                if (dto.groupId) {
                    const productGroupRelation = transactionalEntityManager.create(ProductGroupRelationEntity, {
                        productId: savedProduct.id,
                        groupId: dto.groupId,
                    });
                    await transactionalEntityManager.save(productGroupRelation);
                }

                  // 更新产品分类关联表
                    await transactionalEntityManager.delete(ProductCategoryRelationEntity, { productId: savedProduct.id });
                    if (dto.categories.length > 0) {
                        const categoryIds = dto.categories.map(id => Number(id));
                        const categories = await transactionalEntityManager.find(ProductCategoryEntity, {
                            where: { id: In(categoryIds) },
                        });

                        const productCategoryRelations = categories.map((item, index) =>
                            transactionalEntityManager.create(ProductCategoryRelationEntity, {
                                productId: savedProduct.id,
                                productCategoryId: item.id,
                                level: index + 1,
                            })
                        );
                        await transactionalEntityManager.save(productCategoryRelations);
                    }

                 // 更新产品动态属性关联表
                    await transactionalEntityManager.delete(ProductDynamicAttributeEntity, { productId: savedProduct.id });
                    const dynamicAttributeList = dto.dynamicAttributeList.filter(attr => 
                        attr.attributeValue !== null && 
                        attr.attributeValue !== undefined && 
                        (Array.isArray(attr.attributeValue) ? attr.attributeValue.length > 0 : attr.attributeValue !== ''));
                    for (const attr of dynamicAttributeList) {
                        if (Array.isArray(attr.attributeValue)) {
                            for (const value of attr.attributeValue) {
                                const productDynamicAttributeRelation = transactionalEntityManager.create(ProductDynamicAttributeEntity, {
                                    productId: savedProduct.id,
                                    attributeValueId: value,
                                    attributeId: attr.id,
                                });
                                await transactionalEntityManager.save(productDynamicAttributeRelation);
                            }
                        } else {
                            const productDynamicAttributeRelation = transactionalEntityManager.create(ProductDynamicAttributeEntity, {
                                productId: savedProduct.id,
                                attributeValueId: attr.attributeValue,
                                attributeId: attr.id,
                            });
                            await transactionalEntityManager.save(productDynamicAttributeRelation);
                        }
                    }
                    if (dto.product_spea.length > 0) {

                        Logger.log('====dto.product_spea====',dto.product_spea)

                       // 查询数据库 中已存在的产品规格记录
                       const  existingProductSpecs = await transactionalEntityManager.find(ProductSpecEntity,{
                             where:{productId:savedProduct.id}
                       })


                       // 提取已存在的产品规格记录到一个数组中，方便后续对比
                        const existingSpecMap = new Map();
                        existingProductSpecs.forEach(spec => {
                            existingSpecMap.set(spec.id, spec);
                        });

                        // 构建需要更新或插入的产品规格记录
                        const updatedProductSpecs = [];
                        const newProductSpecs = [];

                        dto.product_spea.forEach(spea => {
                            const existingSpec = Array.from(existingSpecMap.values()).find(spec => spec.id === spea.id);
                            if (existingSpec) {
                                // 如果存在，更新该记录
                                existingSpec.name = spea.name;
                                existingSpec.price = spea.price;
                                existingSpec.stock = spea.stock;
                                existingSpec.weight = spea.weight;
                                existingSpec.packingPrice = spea.packingPrice;
                                existingSpec.unitInfo = spea.unitInfo;
                                updatedProductSpecs.push(existingSpec);
                            } else {
                                // 如果不存在，创建新的记录
                                const newSpec = transactionalEntityManager.create(ProductSpecEntity, {
                                    productId: savedProduct.id,
                                    barcode: spea.barcode,
                                    isActive: ProductSaleStatusEnum.UPSALE,
                                    price: spea.price,
                                    stock: spea.stock,
                                    weight: spea.weight,
                                    name: spea.name,
                                    packingPrice: spea.packingPrice,
                                    unitInfo: spea.unitInfo,
                                });
                                newProductSpecs.push(newSpec);
                            }
                        });

                        let savedProductSpecs;

                        // 更新已存在的产品规格记录
                        if (updatedProductSpecs.length > 0) {
                            savedProductSpecs =  await transactionalEntityManager.save(updatedProductSpecs);
                        }

                        // 插入新的产品规格记录
                        if (newProductSpecs.length > 0) {
                             savedProductSpecs = await transactionalEntityManager.save(newProductSpecs);
                        }


                         // 合并更新和插入的产品规格记录
                        savedProductSpecs = [...(savedProductSpecs || []), ...updatedProductSpecs, ...newProductSpecs];

                        // 确保 savedProductSpecs 中的数据是唯一的
                        savedProductSpecs = Array.from(new Set(savedProductSpecs.map(spec => spec.id))).map(id => savedProductSpecs.find(spec => spec.id === id));
                        // 删除数据库中不再需要的产品规格记录
                        const specIdsToKeep = [...updatedProductSpecs, ...newProductSpecs].map(spec => spec.id);
                        const specsToDelete = Array.from(existingSpecMap.values()).filter(spec => !specIdsToKeep.includes(spec.id));
                        if (specsToDelete.length > 0) {
                            await transactionalEntityManager.remove(specsToDelete);
                        }
                        if (dto.properties.length > 0) {
                            if (!savedProductSpecs || savedProductSpecs.length === 0) {
                                console.error('没有产品规格数据');
                                return;
                            }
                        
                            // 处理属性、属性选项保存操作
                            const {savedProperties,savedPropertyValues} = await this.savePropertyAndPropertieOption(transactionalEntityManager,dto.properties,dto.storeId);

                            Logger.log('// 处理属性、属性选项保存操作')
                            Logger.log(savedProperties,savedPropertyValues)
                            // 保存产品规格属性关联关联关系
                            await this.saveProductSpecPropertyRelation(transactionalEntityManager,savedProductSpecs,savedProperties,savedPropertyValues,savedProduct.id);
                            
                        } else {
                            // 如果没有属性，删除所有关联记录
                            await transactionalEntityManager.delete(ProductSpecAttrRelationEntity, { productId: savedProduct.id });
                        }
                    }
            } catch (error) {
                console.error('修改产品失败', error);
                throw new Error('修改产品失败');
            }
        });
    }

         /**
          * 新建产品
          * @param dto 
          * @returns 
          */
         async create(dto: SaveProductDto): Promise<ProductEntity> {
           return this.productRepository.manager.transaction(async (transactionalEntityManager) => {
             try {

               // 创建产品实体
               const product = transactionalEntityManager.create(ProductEntity, {
                   productName: dto.productName,
                   description:dto.description,
                   businessId:dto.storeId,
                   imageUrl: dto.imageUrl.map(t=>t).toString(),
                   categoryId: dto.categories[dto.categories.length-1],
                   status:ProductAuditStatusEnum.SUCCESS, // 默认审核通过
                   isActive:ProductSaleStatusEnum.UPSALE
               });
           
               // 保存产品表数据
               const savedProduct = await transactionalEntityManager.save(product);
           
               // 创建产品分组关联表实体
               const productGroupRelation = transactionalEntityManager.create(ProductGroupRelationEntity, {
                   productId: product.id, // 明确设置外键字段
                   groupId: dto.groupId,
               });
           
               // 保存产品分组关联表
               await transactionalEntityManager.save(productGroupRelation);

               // 创建产品分类关联表实体
               if(dto.categories.length>0){
                   const categoryIds = dto.categories.map(id => Number(id));
                   const categories = await transactionalEntityManager.find(ProductCategoryEntity, {
                       where: { id: In(categoryIds) },
                   });

                   categories.forEach(async(item,index)=>{
                        const productCategoryRelation = transactionalEntityManager.create(ProductCategoryRelationEntity,{
                            productId:savedProduct.id,
                            productCategoryId:item.id,
                            level:++index,
                        })
                        await transactionalEntityManager.save(productCategoryRelation);
                   })
               }

               
                if (dto.product_spea.length > 0) {
                    // 批量创建产品规格实体
                    const productSpecEntities = dto.product_spea.map(spea =>
                      transactionalEntityManager.create(ProductSpecEntity, {
                        productId: savedProduct.id,
                        barcode: spea.barcode,
                        isActive: ProductSaleStatusEnum.UPSALE,
                        price: spea.price,
                        stock: spea.stock,
                        weight: spea.weight,
                        name: spea.name,
                        packingPrice: spea.packingPrice,
                        unitInfo: spea.unitInfo,
                      })
                    );
                    const savedProductSpecs = await transactionalEntityManager.save(productSpecEntities);

                    if (dto.properties.length > 0) {

                        const {savedProperties,savedPropertyValues} = await this.savePropertyAndPropertieOption(transactionalEntityManager,dto.properties,dto.storeId);

                        await this.saveProductSpecPropertyRelation(transactionalEntityManager,savedProductSpecs,savedProperties,savedPropertyValues,savedProduct.id);
                        // // 构建需要插入的新关联记录
                        // const newRelationEntities = [];

                        // if (!savedProperties || savedProperties.length === 0) {
                        //     console.error('没有属性数据');
                        //     return;
                        // }
                    
                        // // 确保 savedProductSpecs 和 savedProperties 有数据
                        // if (!savedProductSpecs || savedProductSpecs.length === 0) {
                        //     console.error('没有产品规格数据');
                        //     return;
                        // }
                       

                        // // 通用的笛卡尔积函数
                        // function cartesianProduct(arrays) {
                        //     return arrays.reduce((a, b) => a.flatMap(x => b.map(y => [...x, y])), [[]]);
                        // }

                        // // 将属性和属性选项转换为笛卡尔积需要的格式
                        // const propertyOptions =  []

                        // savedProperties.forEach(item=>{
                        //     const propertyValues = savedPropertyValues.filter(pv => pv.productSpecAttrId === item.id);
                        //     propertyOptions.push(propertyValues)
                        // })

                        // // 计算属性选项的笛卡尔积
                        // const propertyCombinations = cartesianProduct(propertyOptions);

                        // // 将每个规格与每个属性组合结合
                        // const allCombinations = cartesianProduct([savedProductSpecs, propertyCombinations]);

                        // // 遍历所有组合，生成关联记录
                        // allCombinations.forEach(combination => {
                        //     const [productSpec, propertyCombination] = combination;
                        //     // const propertyDetails = propertyCombination.map(p => ({
                        //     //     id: p.id,
                        //     //     name: p.name
                        //     // }));

                        //     // 创建新的关联记录
                        //     const newRelation = transactionalEntityManager.create(ProductSpecAttrRelationEntity, {
                        //         productId: savedProduct.id,
                        //         productSpecId: productSpec.id,
                        //         attributeOptionJson:JSON.stringify(propertyCombination),// propertyDetails.map(p => p.id).toString()
                        //     });
                        //     newRelationEntities.push(newRelation);
                        //     // console.log(`规格: ${productSpec.name} (id: ${productSpec.id}), 属性组合: ${propertyDetails.map(p => `${p.name} (id: ${p.id})`).join(', ')}`);
                        // });

                        // // 删除旧的关联记录
                        // await transactionalEntityManager.delete(ProductSpecAttrRelationEntity, { productId: savedProduct.id });
                    
                        // // 插入新的关联记录
                        // if (newRelationEntities.length > 0) {
                        //     await transactionalEntityManager.save(newRelationEntities);
                        // }
                    }
            }

            // 过滤有值的属性
            const dynamicAttributeList = dto.dynamicAttributeList.filter(attr =>attr.attributeValue !== null && attr.attributeValue !== undefined && (Array.isArray(attr.attributeValue) ? attr.attributeValue.length > 0 : attr.attributeValue !== ''));
  
            // 遍历过滤后的属性列表
            for (const attr of dynamicAttributeList) {
                // 检查是否已存在相同的记录
                const existingRecord = await transactionalEntityManager.findOne(ProductDynamicAttributeEntity, {
                where: {
                    productId: savedProduct.id,
                    attributeId: attr.id,
                    attributeValueId: Array.isArray(attr.attributeValue) ? In(attr.attributeValue) : attr.attributeValue,
                },
                });
            
                if (!existingRecord) {
                // 如果 attributeValue 是数组，逐个插入
                if (Array.isArray(attr.attributeValue)) {
                    for (const value of attr.attributeValue) {
                    console.log(`Inserting value: ${value} for attributeId: ${attr.id}`);
                    const productDynamicAttributeRelation = transactionalEntityManager.create(ProductDynamicAttributeEntity, {
                        productId: savedProduct.id,
                        attributeValueId: value,
                        attributeId: attr.id,
                    });
                    await transactionalEntityManager.save(productDynamicAttributeRelation);
                    }
                } else {
                    // 如果 attributeValue 是单个值，直接插入
                    console.log(`Inserting single value: ${attr.attributeValue} for attributeId: ${attr.id}`);
                    const productDynamicAttributeRelation = transactionalEntityManager.create(ProductDynamicAttributeEntity, {
                    productId: savedProduct.id,
                    attributeValueId: attr.attributeValue,
                    attributeId: attr.id,
                    });
                    await transactionalEntityManager.save(productDynamicAttributeRelation);
                }
                } else {
                     console.warn(`Skipping duplicate record for attributeId: ${attr.id}`);
                }
            }
             return savedProduct;
             } catch (error) {
               console.error('新建产品失败', error);
               throw new Error('新建产品失败');
             }
           });
         }


    /**
   * 查询全部产品
   */
    async getProductGroupAll(businessId:number): Promise<any> {
        try {
            const queryBuilder = this.productRepository
            .createQueryBuilder('group')
            .select(['id', 'name']);
        
          if (businessId !== undefined && businessId !== null) {
            queryBuilder.where('group.business_id = :businessId', { businessId });
          }
        
          const groups = await queryBuilder.getRawMany();
          return groups;
        } catch (error) {
          Logger.error('查询品类失败，原因：' + error);
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
      let a = await this.productRepository.delete(ids);
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
