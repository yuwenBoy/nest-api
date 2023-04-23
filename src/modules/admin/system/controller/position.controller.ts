import { Body, Controller, Get, Logger, Post, Query, UseGuards,Request} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { userInfo } from 'os';
import { CurrentUser } from 'src/modules/common/collections-permission/decorators/current.user';
import { PermissionModule } from 'src/modules/common/collections-permission/decorators';
import { PageListVo } from 'src/modules/common/page/pageList';

import { PositionService } from '../service/position.service';
import { ApiAuth } from 'src/modules/common/collections-permission/decorators/api.auth';
import { AuthGuard } from 'src/modules/common/auth/auth.guard';

/***
 * author：zhao.jian
 * createTime：2023-3-8 21:39:18
 * description：职位控制器模块
 */
@ApiTags('职位管理')
@ApiBearerAuth()
@PermissionModule('职位管理')
@UseGuards(AuthGuard)
@ApiAuth()
@Controller('position')
export class PositionController {
  constructor(private readonly positionService: PositionService) {}

  @ApiOperation({ summary: '查询机构下的职位' })
  @Get('/getPositionByDeptId')
  getPositionByDeptId(@Query() query):Promise<any> {
    console.log('接受query参数'+query.pid)
    return this.positionService.getPositionByDeptId(query.deptId);
  }

  @ApiOperation({ summary: '职位管理：查询分页列表' })
  @Post('/getByCondition')
  list(@Body() query):Promise<PageListVo> {
    Logger.log(`【职位管理：查询分页列表】接受参数：${JSON.stringify(query)}`);
    return this.positionService.pageQuery(query);
  }
  
   /**
   * 职位管理-新增职位
   */
   @ApiOperation({ summary: '新增职位' })
   @ApiBearerAuth() // swagger文档设置token
   @Post('/add')
   addUser(@Body() addUserDto: [],@CurrentUser() userInfo): Promise<boolean> {
     Logger.log(`新增职位接收参数：${JSON.stringify(addUserDto)}`);
     return this.positionService.save(addUserDto,userInfo.username);
   }
 
   /**
    * 职位管理-编辑职位
    */
   @ApiOperation({ summary: '编辑职位' })
   @ApiBearerAuth() // swagger文档设置token
   @Post('/edit')
   updateUser(@Body() updateUserDto: [],@CurrentUser() userInfo): Promise<boolean> {
     Logger.log(`编辑职位接收参数：${JSON.stringify(updateUserDto)}`);
     return this.positionService.save(updateUserDto,userInfo.username);
   }
 
   /**
    * 职位管理-删除职位
    */
   @Post('/delete')
   deleteUser(@Body() deleteUserDto: []): Promise<boolean> {
     Logger.log(`删除职位接收参数：${JSON.stringify(deleteUserDto)}`);
     return this.positionService.delete(deleteUserDto);
   }
}
