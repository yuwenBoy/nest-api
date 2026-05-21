import {
  Controller,
  Post,
  Get,
  UseGuards,
  Request,
  Body,
  HttpCode,
  Logger,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HomeService } from '../service/home.service';
import { PageListVo } from 'src/modules/common/page/pageList';
@ApiTags('客户端首页模块')
@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  // 获取首页商家附近门店列表
  @Post('storeList')
  @HttpCode(200)
  async storeList(@Body() query): Promise<PageListVo> {
    Logger.log(`分页查询接受参数：${JSON.stringify(query)}`);
    return this.homeService.pageQuery(query);
  }

  @Post('storeDetail')
  @HttpCode((HttpStatus.OK))
  async getStoreDetail(@Body() query):Promise<any>{
    let storeId = query.storeId || 0;
    if (!storeId) {
        throw new HttpException('缺少参数storeId', HttpStatus.BAD_REQUEST);
    }
    return this.homeService.getStoreDetail(storeId);
  }
}
