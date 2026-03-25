import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { OrderEntity } from 'src/entities/business/order.entity';
import { OrderItemEntity } from 'src/entities/business/order_item.entity';
import { WxPayService } from '../../pay/service/wxpay.service';

@Injectable()
export class UserOrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private orderRepo: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private orderItemRepo: Repository<OrderItemEntity>,
    @InjectConnection() // 核心：添加这个装饰器
    private readonly connection: Connection,
    private readonly wxPayService: WxPayService,
  ) {}

  /**
   * 创建订单
   * @param userId 用户ID
   * @param body
   * @returns
   */
  async create(userId: number, body: any) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const orderNo = Date.now() + '' + Math.floor(Math.random() * 10000);

      // 1. 创建订单
      const order = this.orderRepo.create({
        orderNo,
        userId,
        storeId: body.storeId,
        storeName: body.storeName,
        addressId: body.addressId,
        addressName: body.addressName,
        addressPhone: body.addressPhone,
        addressDetail: body.addressDetail,
        deliveryTime: body.deliveryTime,
        goodsTotal: body.goodsTotal,
        deliveryFee: body.deliveryFee,
        discount: body.discount,
        couponDiscount: body.couponDiscount,
        finalTotal: body.finalTotal,
        remark: body.remark,
        payMethod: body.payMethod,
        payStatus: 0,
        orderStatus: 0,
      });

      const savedOrder = await queryRunner.manager.save(OrderEntity, order);

      // 2. 创建订单项
      const items = JSON.parse(body.goods).map((item) =>
        this.orderItemRepo.create({
          orderId: savedOrder.id,
          orderNo: savedOrder.orderNo,
          productId: item.productId,
          productName: item.productName,
          specName: item.specName,
          price: item.price,
          count: item.count,
        }),
      );

      await queryRunner.manager.save(OrderItemEntity, items);

      await queryRunner.commitTransaction();
      return savedOrder;
    } catch (error) {
      // 回滚事务
      await queryRunner.rollbackTransaction();
      throw error; // 抛出异常让全局过滤器处理
    } finally {
      // 释放连接
      await queryRunner.release();
    }
  }

  async getList(userId: number,status:any) {
    const orders = await this.orderRepo
      .createQueryBuilder('order')

      // 1. 关联 订单明细表 order_item
      .leftJoinAndMapMany(
        'order.items',
        'order_item',
        'item',
        'item.order_id = order.id',
      )

      // 3. 关联商品规格表（正确关联：item.spec_id = spec.id）
      .leftJoin('product_spec', 'spec', 'spec.id = item.product_id')

      // 2. 关联商品表 product
      .leftJoin('product', 'p', 'p.id = spec.product_id')

      // 4. 关联门店表
      .leftJoin('store', 'store', 'store.id = order.store_id')

      .where('order.user_id = :userId', { userId })
      .andWhere(status>-1?'order.order_status = :orderStatus':'order.order_status in (0,1,2,3,4)', { orderStatus: status })
      .select([
        'order.id',
        'order.order_no as orderNo',
        'order.order_status as orderStatus',
        'order.final_total as finalTotal',
        'order.created_at as createTime',

        'store.store_name as storeName',
        'store.avatar_img as storeLogo',

        'item.id as itemId',
        //   'item.product_id as productId',
        'item.product_id as specId',
        'item.count as count',

        'p.product_name as productName',
        'p.image_url as productImg',

        'spec.name as specName',
        'spec.price as specPrice',
      ])

      .orderBy('order.created_at', 'DESC')
      .getRawMany();

    // 格式化结构
    const map = {};
    for (const row of orders) {
      const orderId = row.order_id;

      if (!map[orderId]) {
        map[orderId] = {
          id: orderId,
          orderNo: row.orderNo,
          storeName: row.storeName,
          storeLogo: row.storeLogo,
          orderStatus: row.orderStatus,
          finalTotal: row.finalTotal,
          createTime: row.createTime,
          goods: [],
        };
      }

      if (row.itemId) {
        map[orderId].goods.push({
          productName: row.productName,
          specName: row.specName || '',
          price: row.specPrice || '0.00',
          count: row.count || 1,
          img: row.productImg,
        });
      }
    }

    return Object.values(map);
  }

  async getDetail(id) {
    const order = await this.orderRepo.findOne({ where: { id } });
    const goods = await this.orderItemRepo.find({ where: { orderId: id } });
    return { ...order, goods };
  }
 
  async cancel(id) {
    await this.orderRepo.update(id, { orderStatus: 3 });
  }
}
