import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
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
import { DataSource } from 'typeorm';

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
    private dataSource: DataSource, // ✅ 用于复杂查询
  ) {}

  /**
   * 查询分页列表
   * @param parameter 查询条件
   * @returns list
   */
  /**
   * 查询分页列表
   * @param parameter 查询条件
   * @returns list
   */
  async pageQuery(parameter: any): Promise<PageListVo> {
    try {
      const [pageIndex, pageSize] = [parameter.page, parameter.size];

      const userLat = Number(parameter.lat); // 用户纬度
      const userLng = Number(parameter.lng); // 用户经度

      // 1. 查询门店列表
      let qb = this.storeRepository
        .createQueryBuilder('store')
        .skip((pageIndex - 1) * Number(pageSize))
        .take(pageSize);

      // 添加筛选条件
      if (parameter.name) {
        qb.andWhere('store.storeName LIKE :name', {
          name: `%${parameter.name}%`,
        });
      }

      const [stores, count] = await qb.getManyAndCount();

      if (stores.length === 0) {
        return {
          content: [],
          page: pageIndex,
          size: pageSize,
          totalElements: 0,
          totalPage: 0,
        };
      }

      // 2. 查询营业时间
      const storeIds = stores.map((s) => s.id);
      const hoursList = await this.dataSource
        .createQueryBuilder()
        .select('h')
        .from('store_hours', 'h')
        .where('h.store_id IN (:...storeIds)', { storeIds })
        .getRawMany();

      console.log('hoursList', hoursList);

      // 3. 构建 hoursMap（兼容 h_ 前缀 + 类型转换）
      const hoursMap = new Map();
      hoursList.forEach((h) => {
        const storeId = h.store_id ?? h.h_store_id;
        const dayOfWeek = h.day_of_week ?? h.h_day_of_week;
        const startTime = h.start_time ?? h.h_start_time;
        const endTime = h.end_time ?? h.h_end_time;

        if (!hoursMap.has(storeId)) {
          hoursMap.set(storeId, []);
        }
        hoursMap.get(storeId).push({
          dayOfWeek: Number(dayOfWeek),
          startTime,
          endTime,
        });
      });

      console.log('hoursMap', hoursMap);

      // 4. 计算营业状态
      const now = new Date();
      const jsDay = now.getDay();
      const currentDay = jsDay === 0 ? 7 : jsDay;
      const currentTime = now.getHours() * 60 + now.getMinutes();

      const enrichedData = stores.map((store) => {
        const storeHours = hoursMap.get(store.id) || [];
        const todayHours = storeHours.find((h) => h.dayOfWeek === currentDay);

        let status = '未设置';
        let nextOpenTime = null;
        let todayHoursStr = null;

        if (storeHours.length > 0 && todayHours) {
          const startMinutes = this.timeToMinutes(todayHours.startTime);
          const endMinutes = this.timeToMinutes(todayHours.endTime);
          todayHoursStr = `${todayHours.startTime.slice(
            0,
            5,
          )}-${todayHours.endTime.slice(0, 5)}`;

          if (endMinutes < startMinutes) {
            if (currentTime >= startMinutes || currentTime <= endMinutes) {
              status = '营业中';
            } else if (currentTime < startMinutes) {
              status = '休息中';
              nextOpenTime = todayHours.startTime.slice(0, 5);
            } else {
              status = '已打烊';
              nextOpenTime = this.getNextOpenTime(storeHours, currentDay);
            }
          } else {
            if (currentTime >= startMinutes && currentTime <= endMinutes) {
              status = '营业中';
            } else if (currentTime < startMinutes) {
              status = '休息中';
              nextOpenTime = todayHours.startTime.slice(0, 5);
            } else {
              status = '已打烊';
              nextOpenTime = this.getNextOpenTime(storeHours, currentDay);
            }
          }
        } else if (storeHours.length > 0) {
          status = '今日休息';
          nextOpenTime = this.getNextOpenTime(storeHours, currentDay);
        }

        // ====================== 距离计算 ======================
        let distance = 0;
        let distanceText = '未知距离';
        if (userLat && userLng && store.latitude && store.longitude) {
          distance = this.calculateDistance(
            userLat,
            userLng,
            store.latitude,
            store.longitude,
          );
          distanceText = distance < 1000  ? `${Math.round(distance)}米`  : `${(distance / 1000).toFixed(1)}公里`;
        }
        // ======================================================

        return {
          ...store,
          business_status: status,
          next_open_time: nextOpenTime,
          today_hours: todayHoursStr,
          dayWeek: currentDay,
          distance: Math.round(distance),
          distanceText,
        };
      });

      return {
        content: enrichedData,
        page: pageIndex,
        size: pageSize,
        totalElements: count,
        totalPage: Math.ceil(count / pageSize),
      };
    } catch (error) {
      console.error('查询失败:', error);
      throw new HttpException(
        '查询分页列表失败',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private calculateDistance(
    lat1: number,
    lng1: number,
    lat2: any,
    lng2: any,
  ): number {
    const rad = (d: number) => (d * Math.PI) / 180;
    const R = 6371; // 地球半径 km
    const dLat = rad(lat2 - lat1);
    const dLng = rad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(rad(lat1)) *
        Math.cos(rad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const s = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return s * R * 1000; // 返回 米
  }

  private timeToMinutes(timeStr: string): number {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private getNextOpenTime(hours: any[], currentDay: number): string {
    for (let i = 1; i <= 7; i++) {
      const nextDay = currentDay + i > 7 ? currentDay + i - 7 : currentDay + i;
      const nextHours = hours.find((h) => h.dayOfWeek === nextDay);
      if (nextHours) {
        const dayNames = {
          1: '周一',
          2: '周二',
          3: '周三',
          4: '周四',
          5: '周五',
          6: '周六',
          7: '周日',
        };
        return `${dayNames[nextDay]} ${nextHours.startTime.slice(0, 5)}`;
      }
    }
    return '暂无排班';
  }
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
      select: ['id', 'name','description', 'sort'],
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
      description: group.description,
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
      emptyTip: groupWithProducts.every((g) => g.goods.length === 0) ? '该门店暂无在售商品' : '',
    };
  }
}
