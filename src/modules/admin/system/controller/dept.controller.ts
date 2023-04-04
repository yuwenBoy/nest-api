import { Controller, Get, Post, Body, UseGuards, Req, Logger, Request, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/modules/common/collections-permission/decorators/current.user';
import { PermissionModule } from 'src/modules/common/collections-permission/decorators';

import { DeptService } from '../service/dept.service';
import { AuthGuard } from 'src/modules/common/auth/auth.guard';
import { ApiAuth } from 'src/modules/common/collections-permission/decorators/api.auth';

/***
 * author：zhao.jian
 * createTime：2023-3-22 12:26:18
 * description：组织机构管理控制器模块
 */
@ApiTags('组织机构管理')
@ApiBearerAuth() // swagger文档设置token
@PermissionModule('组织机构管理')
@UseGuards(AuthGuard)
@ApiAuth()
@Controller('dept')
export class DeptController {
  constructor(private readonly deptService: DeptService) {}

  @ApiOperation({ summary: '查询所有机构' })
  @Get('/getDeptTree')
  getDeptTree():Promise<any> {
    return  this.deptService.getDeptTree();
  }

  @ApiOperation({ summary: '查询所有机构' })
  @Get('/getDeptAll')
  getDeptAll():Promise<any> {
    return  this.deptService.getDeptAll();
  }

  @ApiOperation({ summary: '查询机构列表' })
  @Post('/getByCondition')
  list(@Body() query):Promise<any> {
    Logger.log(`分页查询接受参数：${JSON.stringify(query)}`);
    return this.deptService.pageQuery(query);
  }

   /**
   * 组织管理-新增组织
   */
   @ApiOperation({ summary: '新增组织' })
   @Post('/add')
   addUser(@Body() addUserDto: [],@CurrentUser() userInfo): Promise<boolean> {
     Logger.log(`新增组织接收参数：${JSON.stringify(addUserDto)}`);
     return this.deptService.save(addUserDto,userInfo.username);
   }
 
   /**
    * 组织管理-编辑组织
    */
   @ApiOperation({ summary: '编辑组织' })
   @Post('/edit')
   updateUser(@Body() updateUserDto: [],@CurrentUser() userInfo): Promise<boolean> {
     Logger.log(`编辑组织接收参数：${JSON.stringify(updateUserDto)}`);
     return this.deptService.save(updateUserDto,userInfo.username);
   }
 
   /**
    * 组织管理-删除组织
    */
   @ApiOperation({ summary: '删除组织' })
   @Post('/delete')
   deleteUser(@Body() deleteUserDto: []): Promise<boolean> {
     Logger.log(`删除组织接收参数：${JSON.stringify(deleteUserDto)}`);
     return this.deptService.delete(deleteUserDto);
   }
}
