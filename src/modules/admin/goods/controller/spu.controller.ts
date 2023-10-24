import { Body, Controller,Get,Logger,Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from 'src/modules/common/auth/auth.guard';
import { ApiBearerAuth, ApiTags,ApiOperation } from "@nestjs/swagger";
import { ApiAuth, CurrentUser, PermissionModule } from "src/modules/common/collections-permission/decorators";
import { SpuService } from "../service/spu.service";


@ApiTags('spu管理')
@ApiBearerAuth() // swagger文档设置token
@PermissionModule('spu管理')
@UseGuards(AuthGuard)
@ApiAuth()
@Controller('spu')
export class SpuController {
    constructor(private readonly spuService: SpuService) {}

    @Get('test')
    test(){
       return '测试接口';
    }

    @ApiOperation({ summary: '查询spu列表' })
    @Post('/getByCondition')
    list(@Body() query):Promise<any> {
      Logger.log(`分页查询接受参数：${JSON.stringify(query)}`);
      return this.spuService.pageQuery(query);
    }

    
   /**
   * spu管理-新增spu
   */
   @ApiOperation({ summary: '新增spu' })
   @Post('/add')
   addUser(@Body() addUserDto: [],@CurrentUser() userInfo): Promise<boolean> {
     Logger.log(`新增spu接收参数：${JSON.stringify(addUserDto)}`);
     return this.spuService.save(addUserDto,userInfo.username);
   }
 
   /**
    * spu管理-编辑spu
    */
   @ApiOperation({ summary: '编辑spu' })
   @Post('/edit')
   updateUser(@Body() updateUserDto: [],@CurrentUser() userInfo): Promise<boolean> {
     Logger.log(`编辑spu接收参数：${JSON.stringify(updateUserDto)}`);
     return this.spuService.save(updateUserDto,userInfo.username);
   }
 
   /**
    * 组织管理-删除spu
    */
   @ApiOperation({ summary: '删除spu' })
   @Post('/delete')
   deleteUser(@Body() deleteUserDto: []): Promise<boolean> {
     Logger.log(`删除spu接收参数：${JSON.stringify(deleteUserDto)}`);
     return this.spuService.delete(deleteUserDto);
   }

  @ApiOperation({ summary: '查询所有spu' })
  @Get('/getCategoryAll')
  getCategoryAll():Promise<any> {
    return  this.spuService.getCategoryAll();
  }
}