import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository, DataSource } from 'typeorm';
import { OrderEntity, OrderStatus } from '../../../../entities/business/order.entity';
import { OrderItemEntity } from '../../../../entities/business/order_item.entity';
import { StoreEntity } from '../../../../entities/store/store.entity';
import { UserEntity } from '../../../../entities/admin/t_user.entity';
import { WxPayService } from './wxpay.service';
import { ChatGateway } from '../../../../gateway/chat.gateway';

@Injectable()
export class PayService {
  constructor(
    @InjectRepository(OrderEntity)
    private orderRepo: Repository<OrderEntity>,
    private readonly wxPayService: WxPayService,
    private chatGateway: ChatGateway,
    private dataSource: DataSource,
  ) {}

  // 统一支付
  async unifiedPay(orderId: number, payType: string, userId: number) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId, userId },
    });

    if (!order || order.orderStatus !== 0) {
      return { success: false, message: '订单异常' };
    }

    if (payType === 'wechat') {
      // 微信小程序支付
      //   const payParams = await this.wxPayService.createH5Order(
      //     order.orderNo,
      //     Math.round(Number(order.finalTotal) * 100),
      //     order.storeName,
      //     '',
      //   );
      //   return { success: true, payParams };
      return this.payOrder(orderId, userId, payType);
    } else {
      //   // 支付宝支付
      //   const payParams = await this.alipayService.createOrder({
      //     out_trade_no: order.orderNo,
      //     total_amount: order.finalTotal,
      //     subject: order.storeName,
      //   });
      //   return { success: true, payParams };
    }
  }

  /**
   * 微信支付回调
   * @param body
   * @returns
   */
  async handleWechatNotify(body) {
    const orderNo = body.out_trade_no;
    
    // 1. 查询订单
    const order = await this.orderRepo.findOne({
      where: { orderNo },
    });
    
    if (!order) {
      return { code: -1, message: '订单不存在' };
    }
    
    // 2. 防止重复处理
    if (order.payStatus === 1) {
      return { code: 0, message: '订单已处理' };
    }
    
    const now = new Date();
    
    // 3. 更新订单状态为已支付+已接单
    await this.orderRepo.update(
      { orderNo },
      { 
        orderStatus: OrderStatus.ACCEPTED_PREPARE,
        payStatus: 1,
        payMethod: 'wechat',
        payTime: now,
        acceptTime: now,
      },
    );
    
    // 4. 推送新订单通知给商家
    await this.pushOrderToMerchant(order.id, orderNo, order.storeId, now);
    
    return { code: 0, message: '成功' };
  }
  
  /**
   * 推送订单给商家（提取公共方法）
   */
  private async pushOrderToMerchant(orderId: number, orderNo: string, storeId: number, payTime: Date) {
    // 获取更新后的订单信息
    const updatedOrder = await this.orderRepo.findOne({
      where: { id: orderId },
    });

    if (!updatedOrder) return;

    // 查询门店对应的商家用户ID
    const store = await this.dataSource.getRepository(StoreEntity).findOne({
      where: { id: storeId },
      select: ['business_id'],
    });

    if (!store || !store.business_id) return;

    // 查询商家对应的用户ID（商家后台登录用户）
    const merchantUser = await this.dataSource.getRepository(UserEntity).findOne({
      where: { business_id: store.business_id },
      select: ['id'],
    });

    if (!merchantUser) return;

    // 查询订单商品详情
    const orderItems = await this.dataSource.getRepository(OrderItemEntity).find({
      where: { orderId },
    });

    // 构建订单推送数据
    const orderPushData = {
      type: 'new_order',
      orderId: updatedOrder.id,
      orderNo: updatedOrder.orderNo,
      storeId: updatedOrder.storeId,
      storeName: updatedOrder.storeName,
      finalTotal: updatedOrder.finalTotal,
      orderStatus: updatedOrder.orderStatus,
      statusText: '新订单（已自动接单）',
      payTime: payTime,
      autoAccepted: true,
      message: '您有新订单，已自动接单，请尽快备货',
      timestamp: payTime,
      addressName: updatedOrder.addressName,
      addressPhone: updatedOrder.addressPhone,
      addressDetail: updatedOrder.addressDetail,
      remark: updatedOrder.remark,
      items: orderItems.map(item => ({
        goodsName: item.productName,
        specName: item.specName || '',
        quantity: item.count,
        unitPrice: item.price,
        totalPrice: (Number(item.price) * Number(item.count)).toFixed(2),
      })),
    };

    // 推送给商家用户（使用用户ID而非商家ID）
    this.chatGateway.sendOrderToMerchant(merchantUser.id, orderPushData);
  }

  /**
   * 支付宝支付回调
   */
  async handleAlipayNotify(body) {
    const orderNo = body.out_trade_no;
    
    // 1. 查询订单
    const order = await this.orderRepo.findOne({
      where: { orderNo },
    });
    
    if (!order) {
      return 'fail';
    }
    
    // 2. 防止重复处理
    if (order.payStatus === 1) {
      return 'success';
    }
    
    const now = new Date();
    
    // 3. 更新订单状态为已支付+已接单
    await this.orderRepo.update(
      { orderNo },
      { 
        orderStatus: OrderStatus.ACCEPTED_PREPARE,
        payStatus: 1,
        payMethod: 'alipay',
        payTime: now,
        acceptTime: now,
      },
    );
    
    // 4. 推送新订单通知给商家
    await this.pushOrderToMerchant(order.id, orderNo, order.storeId, now);
    
    return 'success';
  }

  async payOrder(orderId: number, userId: number, payType: string) {
    // 1. 查询订单
    const order = await this.orderRepo.findOne({
      where: { id: orderId, userId },
    });

    if (!order) {
      return { success: false, message: '订单不存在' };
    }

    // 2. 判断订单状态
    if (order.orderStatus !== OrderStatus.UNPAID) {
      return { success: false, message: '订单状态不正确' };
    }

    // ======================
    // 这里是模拟支付
    // 上线时替换成 微信支付 / 支付宝支付
    // ======================

    const now = new Date();

    // 3. 支付成功 → 修改订单状态为【已接单/备货中】（自动接单）
    await this.orderRepo.update(orderId, {
      orderStatus: OrderStatus.ACCEPTED_PREPARE, // 2 = 已接单/备货中（自动接单）
      payStatus: 1, // 1 = 已支付
      payMethod: payType,
      payTime: now,
      acceptTime: now, // 记录接单时间
    });

    // 4. 获取更新后的订单信息
    const updatedOrder = await this.orderRepo.findOne({
      where: { id: orderId },
    });

    // 5. 查询门店对应的商家用户ID并推送新订单通知
    const store = await this.dataSource.getRepository(StoreEntity).findOne({
      where: { id: order.storeId },
      select: ['business_id'],
    });

    // 查询商家对应的用户ID（商家后台登录用户）
    let merchantUserId: number | null = null;
    if (store && store.business_id) {
      const merchantUser = await this.dataSource.getRepository(UserEntity).findOne({
        where: { business_id: store.business_id },
        select: ['id'],
      });
      if (merchantUser) {
        merchantUserId = merchantUser.id;
      }
    }

    // 查询订单商品详情（直接从 order_item 取快照数据，无需 JOIN）
    const orderItems = await this.dataSource.getRepository(OrderItemEntity).find({
      where: { orderId },
    });

    // 构建订单推送数据（包含前端需要的完整信息）
    const orderPushData = {
      type: 'new_order',
      orderId: updatedOrder.id,
      orderNo: updatedOrder.orderNo,
      storeId: updatedOrder.storeId,
      storeName: updatedOrder.storeName,
      finalTotal: updatedOrder.finalTotal,
      orderStatus: updatedOrder.orderStatus,
      statusText: '新订单（已自动接单）',
      payTime: now,
      autoAccepted: true,
      message: '您有新订单，已自动接单，请尽快备货',
      timestamp: now,
      // 顾客信息（前端弹窗需要）
      addressName: updatedOrder.addressName,
      addressPhone: updatedOrder.addressPhone,
      addressDetail: updatedOrder.addressDetail,
      remark: updatedOrder.remark,
      // 商品列表（前端弹窗需要）
      items: orderItems.map(item => ({
        goodsName: item.productName,
        specName: item.specName || '',
        quantity: item.count,
        unitPrice: item.price,
        totalPrice: (Number(item.price) * Number(item.count)).toFixed(2),
      })),
    };

    // 推送给商家用户（使用用户ID而非商家ID）
    if (merchantUserId) {
      this.chatGateway.sendOrderToMerchant(merchantUserId, orderPushData);
    }

    // 6. 推送订单状态变更给用户端
    this.chatGateway.server
      .to(`user_${userId}`)
      .emit('order_status_changed', {
        orderId: updatedOrder.id,
        orderNo: updatedOrder.orderNo,
        status: OrderStatus.ACCEPTED_PREPARE,
        statusText: '商家已接单，正在备货中',
        autoAccepted: true,
        timestamp: now,
      });

    return {
      success: true,
      message: '支付成功，商家已自动接单',
      order: {
        id: updatedOrder.id,
        orderNo: updatedOrder.orderNo,
        orderStatus: OrderStatus.ACCEPTED_PREPARE,
        statusText: '商家已接单，正在备货中',
      },
    };
  }
}
