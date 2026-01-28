import { Body, Controller,Get,Logger,Post, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from 'src/modules/common/auth/auth.guard';
import { ApiBearerAuth, ApiTags,ApiOperation } from "@nestjs/swagger";
import { ApiAuth, CurrentUser, PermissionModule } from "src/modules/common/collections-permission/decorators";
import { CategoryService } from "../service/category.service";
import { BusinessCategoryEntity } from "src/entities/business/category.entity";

import { SkipLog } from "src/common/decorators/skip-log.decorator";

@SkipLog() // 标记该不需控制器不需要记录日志
@ApiTags('品类管理')
@ApiBearerAuth() // swagger文档设置token
@PermissionModule('品类管理')
@UseGuards(AuthGuard)
@ApiAuth()
@Controller('businesscategory')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) {}

    @ApiOperation({ summary: '查询品类列表' })
    @Post('/getByCondition')
    list(@Body() query):Promise<any> {
      Logger.log(`分页查询接收参数：${JSON.stringify(query)}`);
      return this.categoryService.pageQuery(query);
    }

   /**
   * 品类管理-新增品类
   */
   @ApiOperation({ summary: '新增品类' })
   @Post('/add')
   addUser(@Body() addUserDto: []): Promise<boolean> {
     Logger.log(`新增品类接收参数：${JSON.stringify(addUserDto)}`);
     return this.categoryService.save(addUserDto);
   }
 
   /**
    * 品类管理-编辑品类
    */
   @ApiOperation({ summary: '编辑品类' })
   @Post('/edit')
   updateUser(@Body() updateUserDto: []): Promise<boolean> {
     Logger.log(`编辑品类接收参数：${JSON.stringify(updateUserDto)}`);
     return this.categoryService.save(updateUserDto);
   }
 
   /**
    * 组织管理-删除品类
    */
   @ApiOperation({ summary: '删除品类' })
   @Post('/delete')
   deleteUser(@Body() deleteUserDto: []): Promise<boolean> {
     Logger.log(`删除品类接收参数：${JSON.stringify(deleteUserDto)}`);
     return this.categoryService.delete(deleteUserDto);
   }

  @ApiOperation({ summary: '查询所有品类' })
  @Get('/getCategoryAll')
  getCategoryAll():Promise<any> {
    return  this.categoryService.getCategoryAll();
  }

  @ApiOperation({ summary: '查询所有主分类' })
  @Get('/main')
  async main(): Promise<BusinessCategoryEntity[]> {
    return this.categoryService.main();
  }

  @ApiOperation({ summary: '根据父分类ID查询次分类' })
  @Get('/sub')
  async getSubCategories(@Query('parent_id') parentId: number): Promise<BusinessCategoryEntity[]> {
    return this.categoryService.getSubCategories(parentId);
  }
}