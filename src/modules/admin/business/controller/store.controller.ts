import { Body, Controller,Get,HttpCode,HttpStatus,Logger,Param,Post, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from '../../../common/auth/auth.guard';
import { ApiBearerAuth, ApiTags,ApiOperation, ApiOkResponse } from "@nestjs/swagger";
import { ApiAuth, CurrentUser, PermissionModule } from '../../../common/collections-permission/decorators';
import { PageListVo } from '../../../common/page/pageList';
import { UserInfoDto } from "../../system/dto/user/userInfo.dto";
import { StoreService } from "../service/store.service";
import { StoreEntity } from '../../../../entities/store/store.entity';
import { UpdateStoreDTO } from "../dto/UpdateStoreDto";
import { StoreOperationDto } from "../dto/store-operation.dto";
import { StoreOperationTypeEnum, StoreStatusEnum } from '../../../../enum/business_enum';


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

    /**
   * 修改门店信息并提交审核
   * @param storeId 门店ID
   * @param dto 修改内容
   * @param req 请求对象（含当前登录用户ID）
   */
  @Post('updateAndSubmitAudit')
  async updateAndSubmitAudit(
    @Body() dto: UpdateStoreDTO,
    @CurrentUser() userInfo: UserInfoDto,
  ) {
    const userId = userInfo.id; // 从token解析的用户ID
    return this.storeService.updateStoreAndSubmitAudit(dto, userId);
  }

   /**
   * 门店头像修改
   * @param storeId 门店ID
   * @param dto 
   * @param req 请求对象（含当前登录用户ID）
   */
  @HttpCode(HttpStatus.OK)
  @Post('modifyShopAvatar')
  async modifyShopAvatar(
    @Body() dto: any,
    @CurrentUser() userInfo: UserInfoDto,
  ) {
    const userId = userInfo.id; // 从token解析的用户ID
    return this.storeService.modifyShopAvatar(dto, userId);
  }

  

  /**
   * 获取门店信息
   * @param dto 
   */
  @Post('getShopInfo')
  async getShopInfo(@Body() dto: any): Promise<any> {
    const storeId = dto.storeId;
    const result = await this.storeService.getStoreInfo(storeId);
    return result;
  }

   // case 1：立即上线
  @Post('online')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '门店立即上线', description: '恢复门店营业状态' })
  async onlineShop(@Body() dto: StoreOperationDto) {
    return await this.storeService.handleStoreOperation(StoreOperationTypeEnum.ONLINE_NOW, dto);
  }

  // case 2：5分钟后关店
  @Post('close-delay')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '门店延时关店', description: '设置门店N分钟后自动暂停营业' })
  async closeShopDelay(@Body() dto: StoreOperationDto) {
    return await this.storeService.handleStoreOperation(StoreOperationTypeEnum.DELAY_PAUSE, dto);
  }

  // case 3：立即关店
  @Post('close-immediate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '门店立即关店', description: '立即暂停营业中的门店' })
  async closeShopImmediate(@Body() dto: StoreOperationDto) {
    return await this.storeService.handleStoreOperation(StoreOperationTypeEnum.PAUSE_NOW, dto);
  }

  // case 4：门店下线
  @Post('offline')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '门店下线', description: '手动将门店转为已下线状态' })
  async offlineShop(@Body() dto: StoreOperationDto) {
    return await this.storeService.handleStoreOperation(StoreOperationTypeEnum.OFFLINE_MANUAL, dto);
  }
}