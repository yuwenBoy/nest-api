import { Controller, Get, Post, Body, UseGuards, Request, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt.auth.guard';

import { RoleModuleService } from '../service/roleModule.service';

/***
 * author：zhao.jian
 * createTime：2022年12月22日14:27:17
 * description：用户业务控制器模块
 */
@Controller('authority')
export class RoleModuleController {
  constructor(private readonly roleModuleService: RoleModuleService) {}
  
  @ApiOperation({ summary: '保存操作权限' })
  @ApiBearerAuth() // swagger文档设置token
  @UseGuards(JwtAuthGuard) // 需要jwt鉴权认证
  @UseGuards(AuthGuard('jwt'))
  @Post('/saveOptionAuthority')
  saveOptionAuthority(@Body() query,@Request() req): Promise<any> {
    console.log('【保存操作权限】接口，接收前端传递参数：',query);
    try {
      if (!query.roleId) {
        return null;
      }else{
        return this.roleModuleService.saveOptionAuthority(query,req.user);
      }
    } catch (error) {
      Logger.error('接口authority/saveOptionAuthority错误，原因:'+error);
    }
  }
}
