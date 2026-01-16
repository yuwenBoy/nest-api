import { Body, Controller,Get,Logger,Post, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from 'src/modules/common/auth/auth.guard';
import { ApiBearerAuth, ApiTags,ApiOperation } from "@nestjs/swagger";
import { ApiAuth, CurrentUser, PermissionModule } from "src/modules/common/collections-permission/decorators";
import { ProductGroupEntity } from "src/entities/product/product_group.entity";
import { ProductGroupService } from "../service/product_group.service";
import { UserInfoDto } from "../../system/dto/user/userInfo.dto";
import { SkipLog } from "src/common/decorators/skip-log.decorator";

@SkipLog() // 标记该不需控制器不需要记录日志
@ApiTags('品类管理')
@ApiBearerAuth() // swagger文档设置token
@PermissionModule('品类管理')
@UseGuards(AuthGuard)
@ApiAuth()
@Controller('product_group')
export class ProductGroupController {
    constructor(private readonly productGroupService: ProductGroupService) {}

    @ApiOperation({ summary: '查询品类列表' })
    @Post('/getByCondition')
    list(@Body() query,@CurrentUser() userInfo: UserInfoDto):Promise<any> {
      return this.productGroupService.pageQuery(query,userInfo.business_id);
    }

   /**
   * 新建分组
   */
   @ApiOperation({ summary: '新建分组' })
   @Post('/add')
   addUser(@Body() params: Partial<ProductGroupEntity>): Promise<ProductGroupEntity> {
     return this.productGroupService.save(params);
   }
 
   /**
    * 编辑分组
    */
   @ApiOperation({ summary: '编辑分组' })
   @Post('/edit')
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
  productGroupAll(@Body() params, @CurrentUser() userInfo: UserInfoDto):Promise<any> {
    return  this.productGroupService.productGroupAll(params,userInfo.business_id);
  }


  @ApiOperation({ summary: '查询门店分组菜单' })
  @Get('/fetchProductGroup')
  fetchProductGroup(@CurrentUser() userInfo: UserInfoDto):Promise<any>{
      return this.productGroupService.fetchProductGroup(userInfo.business_id);
  }
}