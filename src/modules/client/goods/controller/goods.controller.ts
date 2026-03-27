import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { ClientAuthGuard } from 'src/modules/common/auth/client-auth.guard';
import { GoodsService } from '../service/goods.service';

@UseGuards(ClientAuthGuard)
@Controller('goods')
export class GoodsController {
  constructor(private readonly goodsService: GoodsService) {}
 
  // 统一支付接口
  @HttpCode(HttpStatus.OK)
  @Get('detail')
  async unifiedPay() {
    return this.goodsService.detail(1);
  }
}
