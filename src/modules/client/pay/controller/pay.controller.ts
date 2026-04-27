import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ClientAuthGuard } from 'src/modules/common/auth/client-auth.guard';
import { CurrentUser } from 'src/modules/common/collections-permission/decorators';
import { PayService } from '../service/pay.service';

@UseGuards(ClientAuthGuard)
@Controller('pay')
export class PayController {
  constructor(private readonly payService: PayService) {}

  // 统一支付接口
  @HttpCode(HttpStatus.OK)
  @Post('unified')
  async unifiedPay(@Body() body, @Req() req) {
    return this.payService.unifiedPay(
      body.orderId,
      body.payType,
      req.user.id,
    );
  }

  // 模拟支付接口（用于测试自动接单功能）
  @HttpCode(HttpStatus.OK)
  @Post('mock-pay')
  async mockPay(
    @Body() body: { orderId: number; payType?: string },
    @CurrentUser() userInfo: any,
  ) {
    const userId = userInfo.userId;
    const payType = body.payType || 'wechat';
    return this.payService.payOrder(body.orderId, userId, payType);
  }

  // 微信支付回调
  @Post('wechat')
  async wechatNotify(@Body() body) {
    return this.payService.handleWechatNotify(body);
  }
}
