import { Body, Controller,Get,HttpCode,HttpStatus,Logger,Post, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from 'src/modules/common/auth/auth.guard';
import { ApiBearerAuth, ApiTags,ApiOperation, ApiOkResponse } from "@nestjs/swagger";
import { ApiAuth, CurrentUser, PermissionModule } from "src/modules/common/collections-permission/decorators";
import { PageListVo } from "src/modules/common/page/pageList";
import { UserInfoDto } from "../../system/dto/user/userInfo.dto";
import { StoreService } from "../service/store.service";
import { StoreEntity } from "src/entities/store/store.entity";


@ApiTags('门店管理')
@ApiBearerAuth() // swagger文档设置token
@PermissionModule('门店管理')
@UseGuards(AuthGuard)
@ApiAuth()
@Controller('store')
export class StoreController {
    constructor(private readonly storeService: StoreService) {}

     /***
      * 获取分页列表
      */
     @ApiOperation({ summary: '获取分页列表', description: '获取分页列表' })
     @ApiOkResponse({ type: PageListVo, description: '获取门店分页列表' })
     @HttpCode(HttpStatus.OK)
     @Post('/getByCondition')
     pageQuery(@Body() query,@CurrentUser() userInfo: UserInfoDto): Promise<PageListVo> {
       Logger.log(`分页查询接受参数：${JSON.stringify(query)}`);
       return this.storeService.pageQuery(query,userInfo);
   }
      
   /**
   * 店铺管理-新增门店
   */
   @ApiOperation({ summary: '新增门店' })
   @Post('/add')
   addUser(@Body() addUserDto: [],@CurrentUser() userInfo: UserInfoDto): Promise<any> {
     Logger.log(`新增品类接收参数：${JSON.stringify(addUserDto)}`);
     return this.storeService.createStore(addUserDto,userInfo.business_id);
   }

   @Get('/getStoreList')
   getStoreList(@CurrentUser() userInfo: UserInfoDto):Promise<StoreEntity>{
    return this.storeService.getStoreList(userInfo.business_id);
   }
 
   /**
    * 店铺管理-编辑门店
    */
   @ApiOperation({ summary: '编辑门店' })
   @Post('/edit')
   updateUser(@Body() entityDto: []): Promise<any> {
     Logger.log(`编辑品类接收参数：${JSON.stringify(entityDto)}`);
     return this.storeService.updateStore(entityDto);
   }

}