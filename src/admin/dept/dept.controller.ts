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

 
  @ApiOperation({ summary: '获取部门信息' })
  @ApiBearerAuth() // swagger文档设置token
  @UseGuards(AuthGuard('jwt'))
  @Get('/getDeptAll')
  getDeptAll(@Query() query):Promise<any> {
    console.log('接受query参数'+query.pid)
    return this.deptService.getDeptAll(query.pid);
  }
}
