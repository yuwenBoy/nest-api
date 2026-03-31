import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { OrderEntity } from 'src/entities/business/order.entity';
import { WxPayService } from './wxpay.service';
import { ChatGateway } from 'src/gateway/chat.gateway';

@Injectable()
export class PayService {
  constructor(
    @InjectRepository(OrderEntity)
    private orderRepo: Repository<OrderEntity>,
    private readonly wxPayService: WxPayService,
     private chatGateway: ChatGateway,
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
      this.payOrder(orderId, userId, payType);
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
    await this.orderRepo.update(
      { orderNo },
      { orderStatus: 1, payTime: new Date() },
    );
    return { code: 0, message: '成功' };
  }

  /**
   * 支付宝支付回调
   */
  async handleAlipayNotify(body) {
    const orderNo = body.out_trade_no;
    await this.orderRepo.update(
      { orderNo },
      { orderStatus: 1, payTime: new Date() },
    );
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
    if (order.orderStatus !== 0) {
      return { success: false, message: '订单状态不正确' };
    }

    // ======================
    // 这里是模拟支付
    // 上线时替换成 微信支付 / 支付宝支付
    // ======================

    // 3. 支付成功 → 修改订单状态
    await this.orderRepo.update(orderId, {
      orderStatus: 1, // 1 = 待配送 / 已支付
      payStatus:1, // 1 = 已支付
      payMethod: payType,
      payTime: new Date(),
    });

    this.chatGateway.sendOrderToMerchant(
      199,    // 商家用户ID
      order,               // 订单数据
    );

    return {
      success: true,
      message: '支付成功',
    };
  }
}
