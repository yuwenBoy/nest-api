import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from 'src/entities/product/product.entity';
import { ProductGroupEntity } from 'src/entities/product/product_group.entity';
import { ProductGroupRelationEntity } from 'src/entities/product/product_group_relation.entity';
import { ProductSpecEntity } from 'src/entities/product/product_spec.entity';
import { ProductSpecAttrRelationEntity } from 'src/entities/product/product_spec_attr_relation.entity';
import { StoreEntity } from 'src/entities/store/store.entity';
import {
  ProductAuditStatusEnum,
  ProductSaleStatusEnum,
  StoreStatusEnum,
} from 'src/enum/business_enum';
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
    private readonly productGroupRelationRepo: Repository<ProductGroupRelationEntity>,

    @InjectRepository(ProductSpecAttrRelationEntity)
    private readonly productSpecAttrRelationRepo: Repository<ProductSpecAttrRelationEntity>,
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
  /**
   * 查询门店详情
   */
  /**
   * 查询门店详情
   */
  /**
   * 查询门店详情
   */
  /**
   * 查询门店详情
   */
  async getStoreDetail(storeId: any): Promise<any> {
    // 1. 查询门店
    const store = await this.storeRepository.findOne({
      where: {
        id: storeId,
        status: In([StoreStatusEnum.ONLINE, StoreStatusEnum.PAUSE]),
      },
    });
    if (!store) throw new BadRequestException('门店不存在或已下线');

    // 2. 查询分组
    const groups = await this.productGroupRepo.find({
      where: { storeId },
      order: { sort: 'ASC' },
      select: ['id', 'name', 'sort'],
    });

    if (!groups.length) {
      return this.formatResult(store, [], []);
    }

    const groupIds = groups.map((g) => g.id);

    // 3. 查询商品关联关系
    const groupRelations = await this.productGroupRelationRepo.find({
      where: { groupId: In(groupIds) },
      select: ['productId', 'groupId'],
    });

    if (!groupRelations.length) {
      return this.formatResult(
        store,
        groups.map((g) => ({ ...g, goods: [] })),
        groups,
      );
    }

    const productIdToGroupId = new Map<number, number>();
    groupRelations.forEach((r) => {
      productIdToGroupId.set(r.productId, r.groupId);
    });

    const productIds = Array.from(productIdToGroupId.keys());

    // 4. 查询商品
    const products = await this.productRepo.find({
      where: {
        id: In(productIds),
        storeId,
        isActive: ProductSaleStatusEnum.UPSALE,
        status: ProductAuditStatusEnum.SUCCESS,
      },
    });

    if (!products.length) {
      return this.formatResult(
        store,
        groups.map((g) => ({ ...g, goods: [] })),
        groups,
      );
    }

    // 5. 查询规格
    const specs = await this.productSpecRepo.find({
      where: {
        productId: In(productIds),
        stock: MoreThan(0),
      },
      select: ['id', 'productId', 'name', 'price', 'stock'],
    });

    if (!specs.length) {
      return this.formatResult(
        store,
        groups.map((g) => ({ ...g, goods: [] })),
        groups,
      );
    }

    const specIds = specs.map((s) => s.id);

    // 6. 查询规格属性关联（带去重）
    const relations = await this.productSpecAttrRelationRepo.find({
      where: { productSpecId: In(specIds) },
    });

    // 按 productSpecId 收集属性，使用 Map 去重
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

    // 转换回数组
    const finalSpecAttrMap = new Map<number, any[]>();
    specAttrMap.forEach((dedupMap, specId) => {
      finalSpecAttrMap.set(specId, Array.from(dedupMap.values()));
    });

    // 7. 组装商品数据
    const productWithProducts = products
      .map((product) => {
        const productSpecs = specs.filter((s) => s.productId === product.id);
        if (!productSpecs.length) return null;

        const specList = productSpecs.map((spec) => {
          const attrs = finalSpecAttrMap.get(spec.id) || [];

          return {
            specId: spec.id,
            specName: spec.name,
            price: spec.price,
            stock: spec.stock,
            attrs: attrs,
          };
        });

        return {
          productId: product.id,
          name: product.productName,
          img: product.imageUrl,
          desc: product.description,
          sales: 9999,
          original: specList[0]?.price || 0,
          groupId: productIdToGroupId.get(product.id),
          specList: specList,
          defaultSpec: specList[0] || null,
          hasManySpec: specList.length > 1,
        };
      })
      .filter(Boolean);

    // 8. 按分组组装
    const groupWithProducts = groups.map((group) => ({
      groupId: group.id,
      name: group.name,
      sort: group.sort,
      goods: productWithProducts.filter((p) => p.groupId === group.id),
    }));

    return this.formatResult(store, groupWithProducts, groups);
  }

  /**
   * 格式化返回结果（前端友好）
   */
  private formatResult(store, groupWithProducts, groups) {
    return {
      storeInfo: {
        id: store.id,
        name: store.storeName,
        logo: store.avatarImg,
        phone: store.contactInfo,
        address: store.detail_address,
        notice: store.remark,
        monthly_sales: 9999,
        delivery_time: 30,
        delivery_fee: store.delivery_fee ?? 5,
        min_order_amount: store.min_order_amount ?? 30,
        business_hours: '09:00-22:00',
        deliveryScope: store.delivery_scope,
      },
      categories: groupWithProducts, // ✅ 不再有"未分组"
      isOpen: store.status === StoreStatusEnum.ONLINE,
      emptyTip: groupWithProducts.every((g) => g.goods.length === 0)
        ? '该门店暂无在售商品'
        : '',
    };
  }
}
