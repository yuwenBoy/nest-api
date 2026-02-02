import {
  Controller,
  Post,
  Get,
  UseGuards,
  Request,
  Body,
  HttpCode,
  Logger,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HomeService } from '../service/home.service';
import { PageListVo } from 'src/modules/common/page/pageList';
@ApiTags('客户端首页模块')
@Controller('client/home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  // 获取首页商家门店列表
 @Post('storeList')
 @HttpCode(200)
  async storeList(@Body() query) : Promise<PageListVo> {
       Logger.log(`分页查询接受参数：${JSON.stringify(query)}`);
     return this.homeService.pageQuery(query);
  }
}
