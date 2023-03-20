import { Controller, Get, Post, Body, UseGuards, Req, Logger, Request, Query } from '@nestjs/common';
import { Param } from '@nestjs/common/decorators';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt.auth.guard';

import { DeptService } from './dept.service';

/***
 * author：zhao.jian
 * createTime：2022年12月22日14:27:17
 * description：用户业务控制器模块
 */
@ApiTags('组织机构管理')
@Controller('dept')
export class DeptController {
  constructor(private readonly deptService: DeptService) {}

  @ApiOperation({ summary: '查询所有机构树结构' })
  @ApiBearerAuth() // swagger文档设置token
  @UseGuards(AuthGuard('jwt'))
  @Get('/getDeptTree')
  getDeptTree():Promise<any> {
    return  this.deptService.getDeptTree();
  }

  @ApiOperation({ summary: '查询所有机构' })
  @ApiBearerAuth() // swagger文档设置token
  @UseGuards(AuthGuard('jwt'))
  @Get('/getDeptAll')
  getDeptAll():Promise<any> {
    return  this.deptService.getDeptAll();
  }

  @ApiOperation({ summary: '查询机构列表' })
  @ApiBearerAuth() // swagger文档设置token
  @UseGuards(AuthGuard('jwt'))
  @Post('/getByCondition')
  list(@Body() query):Promise<{}> {
    Logger.log(`分页查询接受参数：${JSON.stringify(query)}`);
    return this.deptService.pageQuery(query);
  }


  
  
   /**
   * 组织管理-新增组织
   */
   @ApiOperation({ summary: '新增组织' })
   @ApiBearerAuth() // swagger文档设置token
   @UseGuards(JwtAuthGuard) // 需要jwt鉴权认证
   @Post('/add')
   addUser(@Body() addUserDto: [],@Request() req): Promise<boolean> {
     Logger.log(`新增组织接收参数：${JSON.stringify(addUserDto)}`);
     return this.deptService.save(addUserDto,req.user);
   }
 
   /**
    * 组织管理-编辑组织
    */
   @ApiOperation({ summary: '编辑组织' })
   @ApiBearerAuth() // swagger文档设置token
   @UseGuards(JwtAuthGuard) // 需要jwt鉴权认证
   @Post('/edit')
   updateUser(@Body() updateUserDto: [],@Request() req): Promise<boolean> {
     Logger.log(`编辑组织接收参数：${JSON.stringify(updateUserDto)}`);
     return this.deptService.save(updateUserDto,req.user);
   }
 
   /**
    * 组织管理-删除组织
    */
   @Post('/delete')
   deleteUser(@Body() deleteUserDto: []): Promise<boolean> {
     Logger.log(`删除组织接收参数：${JSON.stringify(deleteUserDto)}`);
     return this.deptService.delete(deleteUserDto);
   }
}
