import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ModuleService } from './module.service';

/***
 * author：zhao.jian
 * createTime：2023-1-11 17:49:48
 * description：菜单控制器模块
 */
@ApiTags('菜单管理')
@Controller('module')
export class ModuleController {
  constructor(private readonly moduleService: ModuleService) {}

  @ApiOperation({ summary: '获取权限菜单' })
  @ApiBearerAuth() // swagger文档设置token
  @UseGuards(AuthGuard('jwt'))
  @Get('/getMenuByRoleId')
  getMenuByRoleId(@Req() req) {
    return req.user.id;
  }
}
