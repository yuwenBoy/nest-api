import { Body, Controller,Get,Logger,Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from 'src/modules/common/auth/auth.guard';
import { ApiBearerAuth, ApiTags,ApiOperation } from "@nestjs/swagger";
import { ApiAuth, CurrentUser, PermissionModule } from "src/modules/common/collections-permission/decorators";
import { CategoryService } from "../service/category.service";


@ApiTags('品类管理')
@ApiBearerAuth() // swagger文档设置token
@PermissionModule('品类管理')
@UseGuards(AuthGuard)
@ApiAuth()
@Controller('category')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) {}

    @Get('test')
    test(){
       return '测试接口';
    }

    @ApiOperation({ summary: '查询品类列表' })
    @Post('/getByCondition')
    list(@Body() query):Promise<any> {
      Logger.log(`分页查询接受参数：${JSON.stringify(query)}`);
      return this.categoryService.pageQuery(query);
    }

    
   /**
   * 品类管理-新增品类
   */
   @ApiOperation({ summary: '新增品类' })
   @Post('/add')
   addUser(@Body() addUserDto: [],@CurrentUser() userInfo): Promise<boolean> {
     Logger.log(`新增品类接收参数：${JSON.stringify(addUserDto)}`);
     return this.categoryService.save(addUserDto,userInfo.username);
   }
 
   /**
    * 品类管理-编辑品类
    */
   @ApiOperation({ summary: '编辑品类' })
   @Post('/edit')
   updateUser(@Body() updateUserDto: [],@CurrentUser() userInfo): Promise<boolean> {
     Logger.log(`编辑品类接收参数：${JSON.stringify(updateUserDto)}`);
     return this.categoryService.save(updateUserDto,userInfo.username);
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
}