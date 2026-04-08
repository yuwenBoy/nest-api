import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { GoodsService } from '../service/goods.service';

@Controller('goods')
export class GoodsController {
  constructor(private readonly goodsService: GoodsService) {}

  // 商品详情接口
  @HttpCode(HttpStatus.OK)
  @Post('detail')
  async detail(@Body('goodsId') goodsId: string) {
    return this.goodsService.detail(Number(goodsId));
  }
}