import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from 'src/entities/product/product.entity';
import { ProductGroupEntity } from 'src/entities/product/product_group.entity';
import { ProductGroupRelationEntity } from 'src/entities/product/product_group_relation.entity';
import { ProductSpecEntity } from 'src/entities/product/product_spec.entity';
import { StoreEntity } from 'src/entities/store/store.entity';
import { ProductAuditStatusEnum, ProductSaleStatusEnum, StoreStatusEnum } from 'src/enum/business_enum';
import { PageListVo } from 'src/modules/common/page/pageList';
import { In, MoreThan, Repository } from 'typeorm';

@Injectable()
export class HomeService {
  constructor(
    @InjectRepository(StoreEntity)
    private readonly storeRepository: Repository<StoreEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
    @InjectRepository(ProductSpecEntity)
    private readonly productSpecRepo: Repository<ProductSpecEntity>,
    @InjectRepository(ProductGroupEntity)
    private readonly productGroupRepo: Repository<ProductGroupEntity>,
    @InjectRepository(ProductGroupRelationEntity)
    private readonly relationRepo: Repository<ProductGroupRelationEntity>,
  ) {}

  /**
   * 查询分页列表
   * @param parameter 查询条件
   * @returns list
   */
  async pageQuery(parameter: any): Promise<PageListVo> {
    try {
      const [pageIndex, pageSize] = [parameter.page, parameter.size];
      let qb = await this.storeRepository
        .createQueryBuilder('store')
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
      throw new HttpException(
        '查询分页列表失败',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /***
   * 查询门店详情
   */
  async getStoreDetail(storeId:any) :Promise<any> {
// 步骤1：查询门店基础信息（先校验门店状态）
  const store = await this.storeRepository.findOne({
    where: { 
      id: storeId,
      status: In([StoreStatusEnum.ONLINE, StoreStatusEnum.PAUSE]) // 仅返回营业中/暂停的门店
    },
    // select: ['id', 'storeName'] // 仅查需要的字段
  });

  if (!store) {
    throw new BadRequestException('门店不存在或已下线');
  }

  // 步骤2：查询该门店的所有商品分组（按分组排序）
  const groups = await this.productGroupRepo.find({
    where: { storeId },
    order: { sort: 'ASC' }, // 按分组排序字段升序
    select: ['id', 'name', 'sort']
  });

   // 3. 查询该门店的有效商品（仅上架状态）
    const products = await this.productRepo.find({
      where: {
        storeId,
        isActive: ProductSaleStatusEnum.UPSALE, // 商品上架状态
        status: ProductAuditStatusEnum.SUCCESS // 商品上架状态
      },
    });
    if (products.length === 0) {
      return this.formatResult(store, [], groups);
    }

    // 4. 查询商品规格（仅库存>0的规格）
    const productIds = products.map(p => p.id);
    const specs = await this.productSpecRepo.find({
      where: {
        productId: In(productIds),
        stock: MoreThan(0) // 过滤无库存规格
      },
      select: ['id', 'productId', 'price', 'stock']
    });

    // 5. 组装商品+规格数据（过滤无有效规格的商品）
    const productWithSpecs = products.map(product => {
      const productSpecList = specs.filter(s => s.productId === product.id);
      // 无有效规格的商品直接过滤
      if (productSpecList.length === 0) return null;

      return {
        productId: product.id,
        name: product.productName,
        img: product.imageUrl,
        desc: product.description,
        sales: 9999, // 商品销量
        original: 9999, // 商品原价
        specList: productSpecList.map(spec => ({
          specId: spec.id,
          specName: spec.name,
          price: spec.price,
          stock: spec.stock
        })),
        ...productSpecList[0], // 商品默认规格
        defaultSpec: productSpecList[0] // 默认选中第一个规格
      };
    }).filter(Boolean); // 过滤null值

    // 6. 查询商品-分组关联关系
    const relations = await this.relationRepo.find({
      where: { productId: In(productWithSpecs.map(p => p.productId)) },
      select: ['groupId', 'productId']
    });

    // 7. 组装分组+商品（含规格）
    const groupWithProducts = this.assembleGroupProducts(groups, productWithSpecs, relations);

    // 8. 返回格式化结果
    return this.formatResult(store, groupWithProducts, groups);
  }

  /**
   * 组装分组+商品数据
   */
  private assembleGroupProducts(groups, productWithSpecs, relations) {
    // 分组商品
    const groupList = groups.map(group => {
      const relateProductIds = relations
        .filter(r => r.groupId === group.id)
        .map(r => r.productId);
      const groupProducts = productWithSpecs.filter(p => relateProductIds.includes(p.productId));
      
      return {
        groupId: group.id,
        name: group.name,
        sort: group.sort,
        goods: groupProducts
      };
    });

    // 未分组商品
    const groupedProductIds = relations.map(r => r.productId);
    const ungroupedProducts = productWithSpecs.filter(p => !groupedProductIds.includes(p.productId));
    if (ungroupedProducts.length > 0) {
      groupList.push({
        groupId: 0,
        groupName: '未分组商品',
        sort: 999,
        productList: ungroupedProducts
      });
    }

    return groupList;
  }

  /**
   * 格式化返回结果（前端友好）
   */
  private formatResult(store, groupWithProducts, groups) {
    return {
      storeInfo: {
        id: store.id,
        name: store.storeName,
        logo: store.doorPhoto,
        phone: store.contactInfo,
        address:store.detail_address,
        notice:store.remark,
        monthly_sales: 9999,
        delivery_time: 30,
        delivery_fee: 5,
        min_order_amount: 30,
        business_hours: '09:00-22:00',
        deliveryScope: store.delivery_scope, // 配送范围(km)
        deliveryFee: store.delivery_fee,     // 配送费(元)
        minOrderAmount: store.min_order_amount, // 起送价(元)
      },
      categories: groupWithProducts,
      isOpen: store.status === StoreStatusEnum.ONLINE, // 是否营业中（前端直接用）
      emptyTip: groupWithProducts.length === 0 ? '该门店暂无在售商品' : ''
    };
  }
}
