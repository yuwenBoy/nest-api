import { Body, Controller,Get,HttpCode,HttpStatus,Logger,Post, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from 'src/modules/common/auth/auth.guard';
import { ApiBearerAuth, ApiTags,ApiOperation, ApiOkResponse } from "@nestjs/swagger";
import { ApiAuth, CurrentUser, PermissionModule } from "src/modules/common/collections-permission/decorators";
import { PageListVo } from "src/modules/common/page/pageList";
import { UserInfoDto } from "../../system/dto/user/userInfo.dto";
import { HoursService } from "../service/hours.service";


@ApiTags('商家营业时间管理')
@ApiBearerAuth() // swagger文档设置token
@PermissionModule('商家营业时间管理')
@UseGuards(AuthGuard)
@ApiAuth()
@Controller('hours')
export class HoursController {
    constructor(private readonly hoursService: HoursService) {}

     /***
      * 获取商家营业时间列表
      */
     @ApiOperation({ summary: '获取商家营业时间列表', description: '分页查询获取商家营业时间列表' })
     @ApiOkResponse({ type: PageListVo, description: '分页查询获取商家营业时间列表' })
     @HttpCode(HttpStatus.OK)
     @Post('/pageQuery')
     pageQuery(@Body() query,@CurrentUser() userInfo: UserInfoDto): Promise<PageListVo> {
       Logger.log(`分页查询接受参数：${JSON.stringify(query)}`);
       return this.hoursService.pageQuery(query,userInfo.business_id);
     }

    /**
   * 设置营业时间
   */
   @ApiOperation({ summary: '设置营业时间' })
   @Post('/updateShopServingTime')
   updateShopServingTime(@Body() requestData: any): Promise<any> {
     return this.hoursService.updateShopServingTime(requestData);
   }
}