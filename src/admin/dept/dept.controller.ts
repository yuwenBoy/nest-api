import { Controller, Get, Post, Body, UseGuards, Req, Logger, Res, Query } from '@nestjs/common';
import { Param } from '@nestjs/common/decorators';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { DeptService } from './dept.service';

/***
 * author：zhao.jian
 * createTime：2022年12月22日14:27:17
 * description：用户业务控制器模块
 */
@ApiTags('用户管理')
@Controller('dept')
export class DeptController {
  constructor(private readonly deptService: DeptService) {}

 
  // @ApiOperation({ summary: '根据parentId获取机构' })
  // @ApiBearerAuth() // swagger文档设置token
  // @UseGuards(AuthGuard('jwt'))
  // @Get('/getDeptAll')
  // getDeptAll(@Query() query):Promise<any> {
  //   console.log('接受query参数'+query.pid)
  //   return this.deptService.getDeptAll(query.pid);
  // }


  @ApiOperation({ summary: '查询所有机构' })
  @ApiBearerAuth() // swagger文档设置token
  @UseGuards(AuthGuard('jwt'))
  @Get('/getDeptTree')
  getDeptTree():Promise<any> {
    return  this.deptService.getDeptTree();
  }

  @ApiOperation({ summary: '查询机构列表' })
  @ApiBearerAuth() // swagger文档设置token
  @UseGuards(AuthGuard('jwt'))
  @Post('/getByCondition')
  list(@Body() query):Promise<{}> {
    Logger.log(`分页查询接受参数：${JSON.stringify(query)}`);
    return this.deptService.pageQuery(query);
  }
}
