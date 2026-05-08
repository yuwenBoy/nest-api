import { Body, Controller,Get,HttpCode,HttpStatus,Logger,Post, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from 'src/modules/common/auth/auth.guard';
import { ApiBearerAuth, ApiTags,ApiOperation, ApiOkResponse } from "@nestjs/swagger";
import { ApiAuth, CurrentUser, PermissionModule } from "src/modules/common/collections-permission/decorators";
import { BusinessService } from "../service/business.service";
import { CreateMerchantApplicationDto } from "../dto/CreateMerchantApplicationDto";
import { PageListVo } from "src/modules/common/page/pageList";
import { CreateMerchantAuditApplicationDto } from "../dto/CreateMerchantAuditApplicationDto";
import { UserInfoDto } from "../../system/dto/user/userInfo.dto";
import { SkipLog } from "src/common/decorators/skip-log.decorator";

@ApiTags('商家管理')
@ApiBearerAuth() // swagger文档设置token
@PermissionModule('商家管理')
@UseGuards(AuthGuard)
@ApiAuth()
@Controller('business')
export class BusinessController {
    constructor(private readonly businessService: BusinessService) {}

     /***
      * 商家入驻申请
      */
   @Post('/create')
   async create(@Body() dto: CreateMerchantApplicationDto) {
     return this.businessService.create(dto);
   }

      /***
      * 平台审核入驻申请
      */
      @Post('/apply')
      async apply(@Body() dto: CreateMerchantAuditApplicationDto,@CurrentUser() userInfo: UserInfoDto) {
        console.log('平台审核入驻申请参数'+JSON.stringify(dto));
        return this.businessService.apply(dto, userInfo.username, userInfo.id);
      }

      
     /***
      * 获取商家审核中列表
      */
     @SkipLog()
     @ApiOperation({ summary: '获取商家审核中列表', description: '分页查询商家审核中列表' })
     @ApiOkResponse({ type: PageListVo, description: '分页查询商家审核返回值' })
     @HttpCode(HttpStatus.OK)
     @Post('/getBusinessAuditList')
     getBusinessAuditList(@Body() query): Promise<PageListVo> {
       Logger.log(`分页查询接受参数：${JSON.stringify(query)}`);
       return this.businessService.pageQuery(query);
     }

     
     /***
      * 获取审核记录列表
      */
     @SkipLog()
     @ApiOkResponse({ type: PageListVo, description: '获取审核记录列表' })
     @HttpCode(HttpStatus.OK)
     @Post('auditLogList')
     getAuditLogList(@Body() query): Promise<PageListVo> {
       return this.businessService.pageAuditLogQuery(query);
     }

      /***
      * 获取商家列表
      */
      @SkipLog()
      @ApiOperation({ summary: '获取商家列表', description: '分页查询商家列表' })
      @ApiOkResponse({ type: PageListVo, description: '分页查询商家列表返回值' })
      @HttpCode(HttpStatus.OK)
      @Post('/getBusinessList')
      getBusinessList(@Body() query,@CurrentUser() userInfo: UserInfoDto): Promise<PageListVo> {
        Logger.log(`分页查询接受参数：${JSON.stringify(query)}`);
        return this.businessService.getBusinessList(query,userInfo.business_id);
      }
}