import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MerchantOrderService } from '../service/merchantOrder.service';
import { AuthGuard } from 'src/modules/common/auth/auth.guard';
import { CurrentUser } from 'src/modules/common/collections-permission/decorators';

@UseGuards(AuthGuard)
@Controller('merchant/order')
export class MerchantOrderController {
  constructor(private readonly merchantOrderService: MerchantOrderService) {}

  /**
   * 获取商家订单列表
   */
  @HttpCode(HttpStatus.OK)
  @Post('list')
  async getOrderList(
    @Body() body: { storeId: number; status?: number | number[]; page?: number; pageSize?: number },
    @CurrentUser() userInfo: any,
  ) {
    const { storeId, status, page, pageSize } = body;
    return await this.merchantOrderService.getMerchantOrders(
      storeId,
      status,
      page,
      pageSize,
    );
  }

  /**
   * 商家接单
   */
  @HttpCode(HttpStatus.OK)
  @Post('accept')
  async acceptOrder(
    @Body() body: { orderId: number; storeId: number },
    @CurrentUser() userInfo: any,
  ) {
    const { orderId, storeId } = body;
    return await this.merchantOrderService.acceptOrder(orderId, storeId);
  }

  /**
   * 商家拒绝接单
   */
  @HttpCode(HttpStatus.OK)
  @Post('reject')
  async rejectOrder(
    @Body() body: { orderId: number; storeId: number; cancelReason: string },
    @CurrentUser() userInfo: any,
  ) {
    const { orderId, storeId, cancelReason } = body;
    return await this.merchantOrderService.rejectOrder(
      orderId,
      storeId,
      cancelReason,
    );
  }

  /**
   * 备货完成
   */
  @HttpCode(HttpStatus.OK)
  @Post('finish-prepare')
  async finishPreparation(
    @Body() body: { orderId: number; storeId: number },
    @CurrentUser() userInfo: any,
  ) {
    const { orderId, storeId } = body;
    return await this.merchantOrderService.finishPreparation(orderId, storeId);
  }

  /**
   * 分配骑手
   */
  @HttpCode(HttpStatus.OK)
  @Post('assign-rider')
  async assignRider(
    @Body()
    body: {
      orderId: number;
      storeId: number;
      riderId: number;
      riderName: string;
      riderPhone: string;
    },
    @CurrentUser() userInfo: any,
  ) {
    const { orderId, storeId, riderId, riderName, riderPhone } = body;
    return await this.merchantOrderService.assignRider(orderId, storeId, {
      riderId,
      riderName,
      riderPhone,
    });
  }

  /**
   * 订单送达确认
   */
  @HttpCode(HttpStatus.OK)
  @Post('complete-delivery')
  async completeDelivery(
    @Body() body: { orderId: number; storeId: number },
    @CurrentUser() userInfo: any,
  ) {
    const { orderId, storeId } = body;
    return await this.merchantOrderService.completeDelivery(orderId, storeId);
  }

  /**
   * 获取订单统计
   */
  @HttpCode(HttpStatus.OK)
  @Post('statistics')
  async getStatistics(
    @Body() body: { storeId: number },
    @CurrentUser() userInfo: any,
  ) {
    const { storeId } = body;
    return await this.merchantOrderService.getOrderStatistics(storeId);
  }

  /**
   * 获取最新订单（用于支付成功后自动接单跳转）
   */
  @HttpCode(HttpStatus.OK)
  @Post('latest')
  async getLatestOrder(
    @Body() body: { storeId: number },
    @CurrentUser() userInfo: any,
  ) {
    const { storeId } = body;
    return await this.merchantOrderService.getLatestOrder(storeId);
  }

  /**
   * 获取待处理订单列表（备货中、待配送）
   */
  @HttpCode(HttpStatus.OK)
  @Post('processing-list')
  async getProcessingOrders(
    @Body() body: { storeId: number; page?: number; pageSize?: number },
    @CurrentUser() userInfo: any,
  ) {
    const { storeId, page, pageSize } = body;
    return await this.merchantOrderService.getProcessingOrders(storeId, page, pageSize);
  }
}
