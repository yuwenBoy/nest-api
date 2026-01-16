import { Body, Controller,Get,Logger,Post, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from 'src/modules/common/auth/auth.guard';
import { ApiBearerAuth, ApiTags,ApiOperation } from "@nestjs/swagger";
import { ApiAuth, CurrentUser, PermissionModule } from "src/modules/common/collections-permission/decorators";
import { BusinessCategoryEntity } from "src/entities/business/category.entity";
import { ProductCategoryService } from "../service/productCategory.service";
import { SkipLog } from "src/common/decorators/skip-log.decorator";

@SkipLog() // 标记该不需控制器不需要记录日志
@ApiTags('产品类目目管理')
@ApiBearerAuth() // swagger文档设置token
@PermissionModule('产品类目目管理')
@UseGuards(AuthGuard)
@ApiAuth()
@Controller('productCategory')
export class ProductCategoryController {
    constructor(private readonly productCategoryService: ProductCategoryService) {}

    @ApiOperation({ summary: '查询产品类目目列表' })
    @Post('/getByCondition')
    list(@Body() query):Promise<any> {
      return this.productCategoryService.pageProductCategoryList(query);
    }

    @ApiOperation({ summary: '查询动态属性下的产品类目列表' })
    @Post('/relevancePageQuery')
    relevancePageQuery(@Body() query):Promise<any> {
        Logger.log(`查询动态属性下的产品类目列表============${JSON.stringify(query)}`);
      return this.productCategoryService.relevancePageQuery(query);
    }
    
   /**
   * 产品类目管理-新增产品类目
   */
   @ApiOperation({ summary: '新增产品类目' })
   @Post('/add')
   addUser(@Body() addUserDto: []): Promise<boolean> {
     Logger.log(`新增产品类目接收参数：${JSON.stringify(addUserDto)}`);
     return this.productCategoryService.save(addUserDto);
   }
 
   /**
    * 产品类目管理-编辑产品类目
    */
   @ApiOperation({ summary: '编辑产品类目' })
   @Post('/edit')
   updateUser(@Body() updateUserDto: []): Promise<boolean> {
     Logger.log(`编辑产品类目接收参数：${JSON.stringify(updateUserDto)}`);
     return this.productCategoryService.save(updateUserDto);
   }
 
   /**
    * 组织管理-删除产品类目
    */
   @ApiOperation({ summary: '删除产品类目' })
   @Post('/delete')
   deleteUser(@Body() deleteUserDto: []): Promise<boolean> {
     Logger.log(`删除产品类目接收参数：${JSON.stringify(deleteUserDto)}`);
     return this.productCategoryService.delete(deleteUserDto);
   }

  @ApiOperation({ summary: '查询所有产品类目' })
  @Get('/getCategoryAll')
  getCategoryAll():Promise<any> {
    return  this.productCategoryService.getCategoryAll();
  }

  @ApiOperation({ summary: '查询所有主分类' })
  @Get('/main')
  async main(): Promise<BusinessCategoryEntity[]> {
    return this.productCategoryService.main();
  }

  @ApiOperation({ summary: '根据父分类ID查询次分类' })
  @Get('/sub')
  async getSubCategories(@Query('parent_id') parentId: number): Promise<BusinessCategoryEntity[]> {
    return this.productCategoryService.getSubCategories(parentId);
  }
}