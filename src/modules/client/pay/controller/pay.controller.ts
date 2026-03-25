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

  // 微信支付回调
  @Post('wechat')
  async wechatNotify(@Body() body) {
    return this.payService.handleWechatNotify(body);
  }
}
