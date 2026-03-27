import { Body, Controller,Get,Logger,Post, Query, UseGuards,Request } from "@nestjs/common";
import { AuthGuard } from 'src/modules/common/auth/auth.guard';
import { ApiBearerAuth, ApiTags,ApiOperation } from "@nestjs/swagger";
import { ApiAuth, CurrentUser, PermissionModule } from "src/modules/common/collections-permission/decorators";
import { UserInfoDto } from "../../system/dto/user/userInfo.dto";
import { SaveProductDto } from "../dto/CreateProductDto";
import { ProductService } from "../service/product.service";
import { ProductEntity } from "src/entities/product/product.entity";
import { SkipLog } from "src/common/decorators/skip-log.decorator";
import { AuthStoreFilterGuard } from "src/modules/common/auth/auth.store.guard";

@ApiTags('产品管理')
@ApiBearerAuth() // swagger文档设置token
@PermissionModule('产品管理')
@UseGuards(AuthGuard)
@UseGuards(AuthStoreFilterGuard)
@ApiAuth()
@Controller('product')
export class ProductController {
    constructor(private readonly productService: ProductService) {}

    @SkipLog()
    @ApiOperation({ summary: '查询产品列表' })
    @Post('productListPager')
    list(@Body() query):Promise<any> {
      Logger.log(`分页查询接受参数：${JSON.stringify(query)}`);
      return this.productService.pageQuery(query);
    }

    @SkipLog()
    @ApiOperation({ summary: '查询产品总数' })
    @Get('getStatistics')
    getStatistics(@Request() req):Promise<any> {
       return this.productService.getStatistics(req);
    }

    @SkipLog()
    @ApiOperation({ summary: '查询商家所属信息' })
    @Get('/fetch_properties')
    fetchProperties(@Request() req):Promise<any> {
      return this.productService.fetchProperties(req.queryParams.store_id);
    }

   /**
   * 新建产品
   */
   @SkipLog()
   @ApiOperation({ summary: '新建产品' })
   @Post('/create')
   addUser(@Body() params:SaveProductDto): Promise<ProductEntity> {
     if(params.id>0){
        return this.productService.update(params);
     }else{
        return this.productService.create(params);
     }
   }
 
   /**
    * 根据产品id获取产品信息
    */
   @SkipLog()
   @ApiOperation({ summary: '根据产品id获取产品信息' })
   @Get('/detail')
   detail(@Query() params): Promise<any> {
    Logger.log('根据产品id获取产品信息')
     return this.productService.detail(params.id);
   }
 
   /**
    * 删除产品
    */
   @ApiOperation({ summary: '删除产品' })
   @Post('/delete')
   deleteUser(@Body() deleteUserDto: []): Promise<boolean> {
     return this.productService.delete(deleteUserDto);
   }

   /**
    * 产品上下架
    * @param params 
    * @returns 
    */
   @ApiOperation({summary:'产品上下架更新'})
   @Post('/updateProductStatus')
   updateProductIsActive(@Body() params):Promise<any>{
    return this.productService.updateProductInfo(params);
   }

    /**
    * 批量改分组、描述
    * @param params 
    * @returns 
    */
    @ApiOperation({summary:'批量改分组、描述'})
    @Post('/batch_update_info')
    batchUpdateInfo(@Body() params):Promise<any>{
      return this.productService.batchUpdateInfo(params);
    }

  @SkipLog()
  @ApiOperation({ summary: '查询所有分组信息' })
  @Get('/getProductGroupAll')
  getProductGroupAll(@CurrentUser() userInfo: UserInfoDto):Promise<any> {
    return  this.productService.getProductGroupAll(userInfo.business_id);
  }
}