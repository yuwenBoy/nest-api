import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { OrderEntity, OrderStatus } from 'src/entities/business/order.entity';
import { OrderItemEntity } from 'src/entities/business/order_item.entity';
import { WxPayService } from '../../pay/service/wxpay.service';
import { ChatGateway } from 'src/gateway/chat.gateway';

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
    private readonly chatGateway: ChatGateway,
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

  async getList(userId: number, status: any) {
    // 将 status 转换为数字
    const statusNum = Number(status);
    
    const queryBuilder = this.orderRepo
      .createQueryBuilder('order')

      // 1. 关联订单明细表 order_item
      .leftJoinAndMapMany(
        'order.items',
        'order_item',
        'item',
        'item.order_id = order.id',
      )

      // 2. 关联门店表
      .leftJoin('store', 'store', 'store.id = order.store_id')
      .leftJoin('product', 'product', 'product.id = item.product_id')
      .where('order.user_id = :userId', { userId });
    
    // 处理状态过滤
    if (!isNaN(statusNum) && statusNum > -1) {
      // 传入指定状态，查询该状态
      queryBuilder.andWhere('order.order_status = :orderStatus', { orderStatus: statusNum });
    } else {
      // 默认查询正常订单（排除已取消、超时关闭、退款的状态）
      queryBuilder.andWhere('order.order_status IN (0,1,2,3,4,5)');
    }
    
    const orders = await queryBuilder
      .select([
        'order.id',
        'order.order_no as orderNo',
        'order.order_status as orderStatus',
        'order.final_total as finalTotal',
        'order.created_at as createTime',

        'store.store_name as storeName',
        'store.avatar_img as storeLogo',

        'item.id as itemId',
        'item.product_id as productId',
        'item.product_name as productName',
        'product.image_url as img',
        'item.spec_name as specName',
        'item.price as unitPrice',
        'item.count as quantity',
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
          items: [],
        };
      }

      if (row.itemId) {
        console.info('看下row',row);
        map[orderId].items.push({
          goodsName: row.productName,
          productName: row.productName,
          specName: row.specName || '',
          unitPrice: row.unitPrice || '0.00',
          price: row.unitPrice || '0.00',
          quantity: row.quantity || 1,
          count: row.quantity || 1,
          goodsImg: row.img, // 订单项快照中没有存储图片，后续可从product表扩展
        });
      }
    }

    // 按创建时间降序排序，确保最新订单在最前面
    return Object.values(map).sort((a: any, b: any) => {
      return new Date(b.createTime).getTime() - new Date(a.createTime).getTime();
    });
  }

  /**
   * 获取订单详情
   * @param orderId 订单ID
   * @param userId 用户ID
   * @returns 订单详情
   */
  async getOrderDetail(orderId: number, userId: number) {
    // 1. 查询订单基本信息
    const order = await this.orderRepo.findOne({
      where: { id: orderId, userId },
    });

    if (!order) {
      return null;
    }

    // 2. 查询订单商品明细
    const goods = await this.orderItemRepo.find({
      where: { orderId },
    });

    // 3. 格式化返回数据
    return {
      id: order.id,
      orderNo: order.orderNo,
      orderStatus: order.orderStatus,
      orderStatusText: this.getStatusText(order.orderStatus),
      createTime: order.createdAt,
      payMethod: order.payMethod,
      payStatus: order.payStatus,
      payTime: order.payTime,
      deliveryTime: order.deliveryTime || '尽快送达',
      storeId: order.storeId,
      storeName: order.storeName,
      goodsTotal: order.goodsTotal,
      deliveryFee: order.deliveryFee,
      discount: order.discount || 0,
      couponDiscount: order.couponDiscount || 0,
      finalTotal: order.finalTotal,
      remark: order.remark || '',
      addressName: order.addressName,
      addressPhone: order.addressPhone,
      addressDetail: order.addressDetail,
      riderId: order.riderId,
      riderName: order.riderName,
      riderPhone: order.riderPhone,
      cancelReason: order.cancelReason,
      cancelTime: order.cancelTime,
      acceptTime: order.acceptTime,
      prepareTime: order.prepareTime,
      deliveryStartTime: order.deliveryStartTime,
      deliveryEndTime: order.deliveryEndTime,
      goods: goods.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        specName: item.specName,
        price: item.price,
        count: item.count,
        img:null, //  item.imageUrl
      })),
    };
  }
 
  /**
   * 用户取消订单（仅限待支付、待接单状态）
   */
  async cancel(orderId: number, userId: number, cancelReason?: string) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId, userId },
    });

    if (!order) {
      return { success: false, message: '订单不存在' };
    }

    // 只有待支付和待接单状态的订单可以取消
    if (
      order.orderStatus !== OrderStatus.UNPAID &&
      order.orderStatus !== OrderStatus.PENDING_ACCEPT
    ) {
      return { success: false, message: '订单状态不允许取消' };
    }

    await this.orderRepo.update(orderId, {
      orderStatus: OrderStatus.CANCELED_MANUAL,
      cancelReason: cancelReason || '用户主动取消',
      cancelTime: new Date(),
    });

    // 通知商家（如果商家在线）
    this.chatGateway.server
      .to(`user_${order.storeId}`) // 假设商家有对应的用户ID
      .emit('order_canceled_by_user', {
        orderId,
        orderNo: order.orderNo,
        cancelReason: cancelReason || '用户主动取消',
        timestamp: new Date(),
      });

    return { success: true, message: '订单已取消' };
  }

  /**
   * 用户确认收货
   */
  async confirmReceipt(orderId: number, userId: number) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId, userId },
    });

    if (!order) {
      return { success: false, message: '订单不存在' };
    }

    if (order.orderStatus !== OrderStatus.PEISONGZHONG) {
      return { success: false, message: '订单状态不正确' };
    }

    await this.orderRepo.update(orderId, {
      orderStatus: OrderStatus.YIWANCHENG,
      deliveryEndTime: new Date(),
    });

    // 通知商家
    this.chatGateway.server
      .to(`user_${order.storeId}`)
      .emit('order_completed', {
        orderId,
        orderNo: order.orderNo,
        status: OrderStatus.YIWANCHENG,
        timestamp: new Date(),
      });

    return { success: true, message: '确认收货成功' };
  }

  /**
   * 用户申请退款
   */
  async applyRefund(
    orderId: number,
    userId: number,
    refundData: { reason: string; refundAmount?: number },
  ) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId, userId },
    });

    if (!order) {
      return { success: false, message: '订单不存在' };
    }

    // 只有已支付且未完成的订单可以申请退款
    const allowRefundStatuses = [
      OrderStatus.PENDING_ACCEPT,
      OrderStatus.ACCEPTED_PREPARE,
      OrderStatus.DAIPEISONG,
      OrderStatus.PEISONGZHONG,
      OrderStatus.YIWANCHENG,
    ];

    if (!allowRefundStatuses.includes(order.orderStatus)) {
      return { success: false, message: '当前订单状态不允许退款' };
    }

    // TODO: 这里应该创建退款记录到 refund 表
    // 简化版：直接标记为退款状态

    await this.orderRepo.update(orderId, {
      orderStatus: OrderStatus.REFUND_ALL_PART,
      cancelReason: refundData.reason,
    });

    // 通知商家
    this.chatGateway.server
      .to(`user_${order.storeId}`)
      .emit('refund_applied', {
        orderId,
        orderNo: order.orderNo,
        reason: refundData.reason,
        refundAmount: refundData.refundAmount || order.finalTotal,
        timestamp: new Date(),
      });

    return { success: true, message: '退款申请已提交' };
  }

  /**
   * 获取订单物流/配送信息
   */
  async getDeliveryInfo(orderId: number, userId: number) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId, userId },
      select: [
        'id',
        'orderNo',
        'orderStatus',
        'riderId',
        'riderName',
        'riderPhone',
        'deliveryStartTime',
        'deliveryEndTime',
        'addressDetail',
      ],
    });

    if (!order) {
      return { success: false, message: '订单不存在' };
    }

    return {
      success: true,
      data: {
        orderId: order.id,
        orderNo: order.orderNo,
        status: order.orderStatus,
        statusText: this.getStatusText(order.orderStatus),
        riderInfo:
          order.orderStatus >= OrderStatus.PEISONGZHONG
            ? {
                riderId: order.riderId,
                riderName: order.riderName,
                riderPhone: order.riderPhone,
              }
            : null,
        deliveryStartTime: order.deliveryStartTime,
        estimatedDeliveryTime: this.calculateEstimatedDelivery(
          order.deliveryStartTime,
        ),
      },
    };
  }

  /**
   * 获取状态文本
   */
  private getStatusText(status: OrderStatus): string {
    const statusMap = {
      [OrderStatus.UNPAID]: '待支付',
      [OrderStatus.PENDING_ACCEPT]: '待接单',
      [OrderStatus.ACCEPTED_PREPARE]: '备货中',
      [OrderStatus.DAIPEISONG]: '待配送',
      [OrderStatus.PEISONGZHONG]: '配送中',
      [OrderStatus.YIWANCHENG]: '已完成',
      [OrderStatus.CANCELED_MANUAL]: '已取消',
      [OrderStatus.CANCELED_TIMEOUT]: '超时关闭',
      [OrderStatus.REFUND_ALL_PART]: '已退款',
    };
    return statusMap[status] || '未知状态';
  }

  /**
   * 计算预计送达时间
   */
  private calculateEstimatedDelivery(startTime: Date): Date {
    if (!startTime) return null;
    const estimated = new Date(startTime);
    estimated.setMinutes(estimated.getMinutes() + 30); // 默认30分钟送达
    return estimated;
  }
}
