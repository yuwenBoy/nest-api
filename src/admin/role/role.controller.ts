import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Query,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { RoleService } from './role.service';

/***
 * author：zhao.jian
 * createTime：2023年3月13日16:34:33
 * description：角色管理业务控制器模块
 */
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}


  @ApiOperation({ summary: '角色管理：查询分页列表' })
  @ApiBearerAuth() // swagger文档设置token
  @UseGuards(AuthGuard('jwt'))
  @Post('/getByCondition')
  list(@Body() query):Promise<{}> {
    Logger.log(`【角色管理：查询分页列表】分页查询接受参数：${JSON.stringify(query)}`);
    return this.roleService.pageQuery(query);
  }


  @ApiOperation({ summary: '查询全部角色' })
  @ApiBearerAuth() // swagger文档设置token
  @UseGuards(AuthGuard('jwt'))
  @Get('/getRoleAll')
  getRoleAll(@Query() query): Promise<any> {
    console.log('接受query参数' + query.userId);
    try {
      if (!query.userId) {
        return null;
      }else{
        return this.roleService.getRoleAll(query.userId);
      }
    } catch (error) {
      Logger.error('接口role/getRoleAll错误，原因:'+error);
    }
  }


  @ApiOperation({ summary: '设置角色' })
  @ApiBearerAuth() // swagger文档设置token
  @UseGuards(AuthGuard('jwt'))
  @Post('/setRoles')
  setRoles(@Body() query): Promise<any> {
    console.log('接受query参数999999999999999999999',query);
    try {
      if (!query.userId) {
        return null;
      }else{
        return this.roleService.setRoles(query);
      }
    } catch (error) {
      Logger.error('接口role/setRoles错误，原因:'+error);
    }
  }
}