import { Body, Controller, Get, Logger, Post, Query, UseGuards,Request} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt.auth.guard';

import { PositionService } from './position.service';

/***
 * author：zhao.jian
 * createTime：2023-3-8 21:39:18
 * description：职位控制器模块
 */
@Controller('position')
export class PositionController {
  constructor(private readonly positionService: PositionService) {}


  @ApiOperation({ summary: '查询机构下的职位' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('/getPositionByDeptId')
  getPositionByDeptId(@Query() query):Promise<any> {
    console.log('接受query参数'+query.pid)
    return this.positionService.getPositionByDeptId(query.deptId);
  }

  @ApiOperation({ summary: '职位管理：查询分页列表' })
  @ApiBearerAuth() // swagger文档设置token
  @UseGuards(AuthGuard('jwt'))
  @Post('/getByCondition')
  list(@Body() query):Promise<{}> {
    Logger.log(`【职位管理：查询分页列表】分页查询接受参数：${JSON.stringify(query)}`);
    return this.positionService.pageQuery(query);
  }

  
   /**
   * 职位管理-新增职位
   */
   @ApiOperation({ summary: '新增职位' })
   @ApiBearerAuth() // swagger文档设置token
   @UseGuards(JwtAuthGuard) // 需要jwt鉴权认证
   @Post('/add')
   addUser(@Body() addUserDto: [],@Request() req): Promise<boolean> {
     Logger.log(`新增职位接收参数：${JSON.stringify(addUserDto)}`);
     return this.positionService.save(addUserDto,req.user);
   }
 
   /**
    * 职位管理-编辑职位
    */
   @ApiOperation({ summary: '编辑职位' })
   @ApiBearerAuth() // swagger文档设置token
   @UseGuards(JwtAuthGuard) // 需要jwt鉴权认证
   @Post('/edit')
   updateUser(@Body() updateUserDto: [],@Request() req): Promise<boolean> {
     Logger.log(`编辑职位接收参数：${JSON.stringify(updateUserDto)}`);
     return this.positionService.save(updateUserDto,req.user);
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
