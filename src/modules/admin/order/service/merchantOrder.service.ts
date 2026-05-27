import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity, OrderStatus } from '../../../../entities/business/order.entity';
import { OrderItemEntity } from '../../../../entities/business/order_item.entity';
import { ChatGateway } from '../../../../gateway/chat.gateway';

@Injectable()
export class MerchantOrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private orderRepo: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private orderItemRepo: Repository<OrderItemEntity>,
    private chatGateway: ChatGateway,
  ) {}

  /**
   * 获取商家订单列表
   */
  async getMerchantOrders(
    storeId: number,
    status?: number | number[],
    page = 1,
    pageSize = 20,
  ) {
    // 1. 先查询订单列表（不带 items）
    const query = this.orderRepo
      .createQueryBuilder('order')
      .where('order.store_id = :storeId', { storeId });

    if (status !== undefined && status !== null) {
      // 支持单个状态或状态数组
      const statusArray = Array.isArray(status) ? status : [status];
      if (statusArray.length === 1) {
        query.andWhere('order.order_status = :status', { status: statusArray[0] });
      } else {
        query.andWhere('order.order_status IN (:...statuses)', { statuses: statusArray });
      }
    }

    const [orders, total] = await query
      .orderBy('order.created_at', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    // 2. 查询这些订单的 items
    const orderIds = orders.map(o => o.id);
    let itemsMap: Record<number, OrderItemEntity[]> = {};
    
    if (orderIds.length > 0) {
      const items = await this.orderItemRepo
        .createQueryBuilder('item')
        .where('item.order_id IN (:...orderIds)', { orderIds })
        .getMany();
      
      // 按 order_id 分组
      itemsMap = items.reduce((map, item) => {
        if (!map[item.orderId]) {
          map[item.orderId] = [];
        }
        map[item.orderId].push(item);
        return map;
      }, {});
    }

    // 3. 组装数据
    const list = orders.map(order => ({
      ...order,
      items: itemsMap[order.id] || [],
    }));

    return {
      success: true,
      content: list,
      page,
      size: pageSize,
      totalElements: total,
      totalPage: Math.ceil(total / pageSize),
    };
  }

  /**
   * 商家接单
   */
  async acceptOrder(orderId: number, storeId: number) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId, storeId },
    });

    if (!order) {
      return { success: false, message: '订单不存在' };
    }

    if (order.orderStatus !== OrderStatus.PENDING_ACCEPT) {
      return { success: false, message: '订单状态不正确，无法接单' };
    }

    await this.orderRepo.update(orderId, {
      orderStatus: OrderStatus.ACCEPTED_PREPARE,
      acceptTime: new Date(),
    });

    // 推送给用户：商家已接单
    this.chatGateway.server
      .to(`user_${order.userId}`)
      .emit('order_status_changed', {
        orderId,
        orderNo: order.orderNo,
        status: OrderStatus.ACCEPTED_PREPARE,
        statusText: '商家已接单，正在备货中',
        timestamp: new Date(),
      });

    return { success: true, message: '接单成功' };
  }

  /**
   * 商家拒绝接单（取消订单）
   */
  async rejectOrder(
    orderId: number,
    storeId: number,
    cancelReason: string,
  ) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId, storeId },
    });

    if (!order) {
      return { success: false, message: '订单不存在' };
    }

    if (order.orderStatus !== OrderStatus.PENDING_ACCEPT) {
      return { success: false, message: '订单状态不正确' };
    }

    await this.orderRepo.update(orderId, {
      orderStatus: OrderStatus.CANCELED_MANUAL,
      cancelReason,
      cancelTime: new Date(),
    });

    // 推送给用户：商家拒单
    this.chatGateway.server
      .to(`user_${order.userId}`)
      .emit('order_status_changed', {
        orderId,
        orderNo: order.orderNo,
        status: OrderStatus.CANCELED_MANUAL,
        statusText: '商家已取消订单',
        cancelReason,
        timestamp: new Date(),
      });

    return { success: true, message: '已取消订单' };
  }

  /**
   * 备货完成，通知配送
   */
  async finishPreparation(orderId: number, storeId: number) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId, storeId },
    });

    if (!order) {
      return { success: false, message: '订单不存在' };
    }

    if (order.orderStatus !== OrderStatus.ACCEPTED_PREPARE) {
      return { success: false, message: '订单状态不正确' };
    }

    await this.orderRepo.update(orderId, {
      orderStatus: OrderStatus.DAIPEISONG,
      prepareTime: new Date(),
    });

    // 推送给用户：备货完成，等待配送
    this.chatGateway.server
      .to(`user_${order.userId}`)
      .emit('order_status_changed', {
        orderId,
        orderNo: order.orderNo,
        status: OrderStatus.DAIPEISONG,
        statusText: '商家备货完成，等待骑手取货',
        timestamp: new Date(),
      });

    return { success: true, message: '备货完成' };
  }

  /**
   * 分配骑手（商家自配送或平台配送）
   */
  async assignRider(
    orderId: number,
    storeId: number,
    riderInfo: { riderId: number; riderName: string; riderPhone: string },
  ) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId, storeId },
    });

    if (!order) {
      return { success: false, message: '订单不存在' };
    }

    if (order.orderStatus !== OrderStatus.DAIPEISONG) {
      return { success: false, message: '订单状态不正确' };
    }

    await this.orderRepo.update(orderId, {
      orderStatus: OrderStatus.PEISONGZHONG,
      riderId: riderInfo.riderId,
      riderName: riderInfo.riderName,
      riderPhone: riderInfo.riderPhone,
      deliveryStartTime: new Date(),
    });

    // 推送给用户：骑手已接单，配送中
    this.chatGateway.server
      .to(`user_${order.userId}`)
      .emit('order_status_changed', {
        orderId,
        orderNo: order.orderNo,
        status: OrderStatus.PEISONGZHONG,
        statusText: '骑手已取货，配送中',
        riderName: riderInfo.riderName,
        riderPhone: riderInfo.riderPhone,
        timestamp: new Date(),
      });

    return { success: true, message: '骑手分配成功，开始配送' };
  }

  /**
   * 订单送达
   */
  async completeDelivery(orderId: number, storeId: number) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId, storeId },
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

    // 推送给用户：订单已送达
    this.chatGateway.server
      .to(`user_${order.userId}`)
      .emit('order_status_changed', {
        orderId,
        orderNo: order.orderNo,
        status: OrderStatus.YIWANCHENG,
        statusText: '订单已送达',
        timestamp: new Date(),
      });

    return { success: true, message: '订单已完成' };
  }

  /**
   * 获取订单统计
   */
  async getOrderStatistics(storeId: number) {
    const stats = await this.orderRepo
      .createQueryBuilder('order')
      .select('order.order_status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('order.store_id = :storeId', { storeId })
      .groupBy('order.order_status')
      .getRawMany();

    const result = {
      pendingPay: 0,    // 待支付
      pendingAccept: 0, // 待接单
      preparing: 0,     // 备货中
      pendingDelivery: 0, // 待配送
      delivering: 0,    // 配送中
      completed: 0,     // 已完成
      canceled: 0,      // 已取消
    };

    stats.forEach((item) => {
      const count = parseInt(item.count, 10);
      switch (parseInt(item.status, 10)) {
        case OrderStatus.UNPAID:
          result.pendingPay = count;
          break;
        case OrderStatus.PENDING_ACCEPT:
          result.pendingAccept = count;
          break;
        case OrderStatus.ACCEPTED_PREPARE:
          result.preparing = count;
          break;
        case OrderStatus.DAIPEISONG:
          result.pendingDelivery = count;
          break;
        case OrderStatus.PEISONGZHONG:
          result.delivering = count;
          break;
        case OrderStatus.YIWANCHENG:
          result.completed = count;
          break;
        case OrderStatus.CANCELED_MANUAL:
        case OrderStatus.CANCELED_TIMEOUT:
        case OrderStatus.REFUND_ALL_PART:
          result.canceled += count;
          break;
      }
    });

    return result;
  }

  /**
   * 获取最新订单（支付成功后用于弹窗）
   */
  async getLatestOrder(storeId: number) {
    const order = await this.orderRepo
      .createQueryBuilder('order')
      .where('order.store_id = :storeId', { storeId })
      .orderBy('order.created_at', 'DESC')
      .getOne();

    if (!order) {
      return { success: false, message: '暂无订单' };
    }

    // 获取订单商品详情
    const items = await this.orderItemRepo.find({
      where: { orderId: order.id },
    });

    return {
      success: true,
      data: {
        ...order,
        items,
        statusText: this.getStatusText(order.orderStatus),
      },
    };
  }

  /**
   * 获取待处理订单列表（备货中、待配送）
   */
  async getProcessingOrders(
    storeId: number,
    page = 1,
    pageSize = 20,
  ) {
    const processingStatuses = [
      OrderStatus.ACCEPTED_PREPARE, // 备货中
      OrderStatus.DAIPEISONG,       // 待配送
      OrderStatus.PEISONGZHONG,     // 配送中
    ];

    const [orders, total] = await this.orderRepo
      .createQueryBuilder('order')
      .where('order.store_id = :storeId', { storeId })
      .andWhere('order.order_status IN (:...statuses)', {
        statuses: processingStatuses,
      })
      .orderBy('order.accept_time', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    // 获取订单商品
    const orderIds = orders.map((o) => o.id);
    let itemsMap: Record<number, any[]> = {};

    if (orderIds.length > 0) {
      const items = await this.orderItemRepo
        .createQueryBuilder('item')
        .where('item.order_id IN (:...orderIds)', { orderIds })
        .getMany();

      itemsMap = items.reduce((map, item) => {
        if (!map[item.orderId]) {
          map[item.orderId] = [];
        }
        map[item.orderId].push(item);
        return map;
      }, {});
    }

    const list = orders.map((order) => ({
      ...order,
      items: itemsMap[order.id] || [],
      statusText: this.getStatusText(order.orderStatus),
    }));

    return {
      success: true,
      content: list,
      page,
      size: pageSize,
      totalElements: total,
      totalPage: Math.ceil(total / pageSize),
    };
  }

  /**
   * 获取状态文本
   */
  private getStatusText(status: OrderStatus): string {
    const statusMap: Record<OrderStatus, string> = {
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
}
