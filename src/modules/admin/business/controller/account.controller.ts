import { Body, Controller,Get,HttpCode,HttpStatus,Logger,Post, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from '../../../common/auth/auth.guard';
import { ApiBearerAuth, ApiTags,ApiOperation, ApiOkResponse } from "@nestjs/swagger";
import { ApiAuth, CurrentUser, PermissionModule } from '../../../common/collections-permission/decorators';
import { BusinessService } from "../service/business.service";
import { PageListVo } from '../../../common/page/pageList';
import { AccountService } from "../service/account.service";
import { UserInfo } from "os";
import { UserInfoDto } from "../../system/dto/user/userInfo.dto";


@ApiTags('商家账户管理')
@ApiBearerAuth() // swagger文档设置token
@PermissionModule('商家账户管理')
@UseGuards(AuthGuard)
@ApiAuth()
@Controller('account')
export class AccountController {
    constructor(private readonly accountService: AccountService) {}

     /***
      * 获取商家账户列表
      */
     @ApiOperation({ summary: '获取商家账户列表', description: '分页查询获取商家账户列表' })
     @ApiOkResponse({ type: PageListVo, description: '分页查询获取商家账户列表' })
     @HttpCode(HttpStatus.OK)
     @Post('/pageQuery')
     pageQuery(@Body() query,@CurrentUser() userInfo: UserInfoDto): Promise<PageListVo> {
       Logger.log(`分页查询接受参数：${JSON.stringify(query)}`);
       return this.accountService.pageQuery(query,userInfo.business_id);
     }
}