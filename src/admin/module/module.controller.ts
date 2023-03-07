import { Controller, Get, UseGuards, Request, Inject } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from 'src/entities/t_user_role.entity';
import { Any } from 'typeorm';
import { RoleModuleService } from '../roleModule/roleModule.service';
import { UserRoleService } from '../userRole/userRole.service';

import { ModuleService } from './module.service';

/***
 * author：zhao.jian
 * createTime：2023-1-11 17:49:48
 * description：菜单控制器模块
 */
@ApiTags('菜单管理')
@Controller('module')
export class ModuleController {
  constructor(
    private readonly moduleService:ModuleService,
    // 注入userRoleService服务
    private readonly userRoleService:UserRoleService,
    // 注入角色模块服务
    private readonly roleModuleService:RoleModuleService,
    ) {}

  @ApiOperation({ summary: '获取权限菜单' })
  @ApiBearerAuth() // swagger文档设置token
  @UseGuards(AuthGuard('jwt'))
  @Get('/getMenuAll')
  async getMenuAll(@Request() req) {
    // 获取用户角色
    const roles =  await this.userRoleService.getRoleIds(req.user.id);
    const role_ids = roles.map(item=>{return item.role_id}).toString();
    const modules = await this.roleModuleService.getModuleIds(role_ids);
    const module_ids = modules.map(item=>{return item.t_module_id}).toString();
    const result = await this.moduleService.getMenuByIds(module_ids);
    console.log('1200000000000000000==========='+roles.map(item=>{return item.role_id}).toString());
    return result;
  }
}
