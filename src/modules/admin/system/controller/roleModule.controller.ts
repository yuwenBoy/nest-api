import { Controller, Get, Post, Body, UseGuards, Request, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorator/current.user';
import { PermissionModule } from 'src/modules/common/collections-permission/decorators';
import { JwtAuthGuard } from '../auth/jwt.auth.guard';
import { RoleModuleDto } from '../dto/roleModule.dto';
import { UserInfoDto } from '../dto/user/userInfo.dto';

import { RoleModuleService } from '../service/roleModule.service';

/***
 * author：zhao.jian
 * createTime：2022年12月22日14:27:17
 * description：用户业务控制器模块
 */
@ApiTags('操作权限管理')
@ApiBearerAuth()
@PermissionModule('操作权限管理')
@UseGuards(JwtAuthGuard)
@Controller('authority')
export class RoleModuleController {
  constructor(private readonly roleModuleService: RoleModuleService) {}
  
  @ApiOperation({ summary: '保存操作权限' })
  @ApiBearerAuth() // swagger文档设置token
  @UseGuards(JwtAuthGuard) // 需要jwt鉴权认证
  @UseGuards(AuthGuard('jwt'))
  @Post('/saveOptionAuthority')
  saveOptionAuthority(@Body() req:RoleModuleDto,@CurrentUser() currentUser:UserInfoDto): Promise<any> {
    console.log('【保存操作权限控制器层，接收参数：',req);
    try {
      if (!req.roleId) {
        return;
      }else{
        return this.roleModuleService.saveOptionAuthority(req,currentUser);
      }
    } catch (error) {
      Logger.error('接口authority/saveOptionAuthority错误，原因:'+error);
    }
  }
}
