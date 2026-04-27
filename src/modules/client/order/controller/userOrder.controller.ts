import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserOrderService } from '../service/userOrder.service';
import { ClientAuthGuard } from 'src/modules/common/auth/client-auth.guard';
import { CurrentUser } from 'src/modules/common/collections-permission/decorators';

@UseGuards(ClientAuthGuard)
@Controller('order')
export class userOrderController {
  constructor(private readonly orderService: UserOrderService) {}

  /**
   * 创建订单
   * @param body
   * @param userInfo 当前客户信息
   * @returns
   */
  @HttpCode(HttpStatus.OK)
  @Post('create')
  async create(@Body() body, @CurrentUser() userInfo: any) {
    const userId = userInfo.userId;
    console.log('userInfo', userInfo);
    const order = await this.orderService.create(userId, body);
    return {
      success: true,
      result: order,
    };
  }

  /**
   * 获取订单
   * @param body
   * @param userInfo 当前客户信息
   * @returns
   */
  @HttpCode(HttpStatus.OK)
  @Post('list')
  async orderList(@Body() body,@CurrentUser() userInfo: any) {
    const userId = userInfo.userId;
    return await this.orderService.getList(userId,body.status);
  }
  /**
   * 取消订单
   * @param userInfo 当前客户信息
   * @returns
   */
  @HttpCode(HttpStatus.OK)
  @Post('cancel')
  async orderCancel(
    @Body() body: { orderId: number; cancelReason?: string },
    @CurrentUser() userInfo: any,
  ) {
    const userId = userInfo.userId;
    const result = await this.orderService.cancel(
      body.orderId,
      userId,
      body.cancelReason,
    );
    return result;
  }

  /**
   * 确认收货
   */
  @HttpCode(HttpStatus.OK)
  @Post('confirm-receipt')
  async confirmReceipt(
    @Body() body: { orderId: number },
    @CurrentUser() userInfo: any,
  ) {
    const userId = userInfo.userId;
    return await this.orderService.confirmReceipt(body.orderId, userId);
  }

  /**
   * 申请退款
   */
  @HttpCode(HttpStatus.OK)
  @Post('apply-refund')
  async applyRefund(
    @Body()
    body: { orderId: number; reason: string; refundAmount?: number },
    @CurrentUser() userInfo: any,
  ) {
    const userId = userInfo.userId;
    return await this.orderService.applyRefund(body.orderId, userId, {
      reason: body.reason,
      refundAmount: body.refundAmount,
    });
  }

  /**
   * 获取配送信息
   */
  @HttpCode(HttpStatus.OK)
  @Post('delivery-info')
  async getDeliveryInfo(
    @Body() body: { orderId: number },
    @CurrentUser() userInfo: any,
  ) {
    const userId = userInfo.userId;
    return await this.orderService.getDeliveryInfo(body.orderId, userId);
  }

  /**
   * 获取订单详情
   */
  @HttpCode(HttpStatus.OK)
  @Post('detail')
  async getOrderDetail(
    @Body() body: { orderId: number },
    @CurrentUser() userInfo: any,
  ) {
    const userId = userInfo.userId;
    const result = await this.orderService.getOrderDetail(body.orderId, userId);
    return result
  }
}
