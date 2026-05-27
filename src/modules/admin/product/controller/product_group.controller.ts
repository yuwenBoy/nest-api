import { Body, Controller,Get,Post, Query, UseGuards,Request } from "@nestjs/common";
import { AuthGuard } from '../../../common/auth/auth.guard';
import { ApiBearerAuth, ApiTags,ApiOperation } from "@nestjs/swagger";
import { ApiAuth, PermissionModule } from '../../../common/collections-permission/decorators';
import { ProductGroupEntity } from '../../../../entities/product/product_group.entity';
import { ProductGroupService } from "../service/product_group.service";
import { SkipLog } from '../../../../common/decorators/skip-log.decorator';
import { AuthStoreFilterGuard } from '../../../common/auth/auth.store.guard';

@SkipLog() // 标记该不需控制器不需要记录日志
@ApiTags('品类管理')
@ApiBearerAuth() // swagger文档设置token
@PermissionModule('品类管理')
@UseGuards(AuthGuard)
@UseGuards(AuthStoreFilterGuard)
@ApiAuth()
@Controller('product_group')
export class ProductGroupController {
    constructor(private readonly productGroupService: ProductGroupService) {}

    @ApiOperation({ summary: '查询分组菜单列表' })
    @Post('getByCondition')
    list(@Request() req, @Body() query):Promise<any> {
      return this.productGroupService.pageQuery(req,query);
    }

   /**
   * 新建分组
   */
   @ApiOperation({ summary: '新建分组' })
   @Post('add')
   addUser(@Body() params: Partial<ProductGroupEntity>): Promise<ProductGroupEntity> {
     return this.productGroupService.save(params);
   }
 
   /**
    * 编辑分组
    */
   @ApiOperation({ summary: '编辑分组' })
   @Post('edit')
   updateUser(@Body() params: Partial<ProductGroupEntity>): Promise<ProductGroupEntity> {
     return this.productGroupService.save(params);
   }
 
   /**
    * 删除分组
    */
   @ApiOperation({ summary: '删除分组' })
   @Post('/delete')
   deleteUser(@Body() deleteUserDto: []): Promise<boolean> {
     return this.productGroupService.delete(deleteUserDto);
   }

  @ApiOperation({ summary: '查询所有分组' })
  @Post('/productGroupAll')
  productGroupAll(@Request() req, @Body() params):Promise<any> {
    return  this.productGroupService.productGroupAll(req,params);
  }

  @ApiOperation({ summary: '查询门店分组菜单' })
  @Get('/fetchProductGroup')
  fetchProductGroup(@Request() req):Promise<ProductGroupEntity[]>{
     return this.productGroupService.fetchProductGroup(req);
  }
}