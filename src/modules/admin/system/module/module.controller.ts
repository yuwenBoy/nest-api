import { Controller, Get, UseGuards, Request, Logger } from '@nestjs/common';
import { Body, Post, Query } from '@nestjs/common/decorators';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt.auth.guard';
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
    Logger.log('当前用户'+req.user.id+'操作权限');
    const roles =  await this.userRoleService.getRoleIds(req.user.id);
    if(roles.length>0){
      const role_ids = roles.map(item=>{return item.role_id}).toString();
      const modules = await this.roleModuleService.getModuleIds(role_ids);
      if(modules.length>0){
        const module_ids = modules.map(item=>{return item.t_module_id}).toString();
        const result = await this.moduleService.getMenuByIds(module_ids);
        return result;
      }
    
    }else{
      return []
    }
  }

  @ApiOperation({ summary: '获取系统全部资源' })
  @ApiBearerAuth() // swagger文档设置token
  @UseGuards(AuthGuard('jwt'))
  @Get('/getModuleList')
  async getModuleList(@Request() req) {
     return await this.moduleService.getModuleList();
  }

  
  @ApiOperation({ summary: '查询权限资源' })
  @ApiBearerAuth() // swagger文档设置token
  @UseGuards(AuthGuard('jwt'))
  @Get('/findByRoleId')
  async findByRoleId(@Query() query) {
    Logger.log('【菜单模块---->【查询权限资源】-------->findByRoleId接口----> 请求参数】'+query.roleId)
     return await this.moduleService.findByRoleId(query.roleId);
  }

  
  @ApiOperation({ summary: '查询资源列表' })
  @ApiBearerAuth() // swagger文档设置token
  @UseGuards(AuthGuard('jwt'))
  @Post('/getByCondition')
  list(@Body() query):Promise<{}> {
    Logger.log(`分页查询接受参数999999999999999999999999999999999999999：${JSON.stringify(query)}`);
    return this.moduleService.pageQuery(query);
  }

  
   /**
   * 资源管理-新增资源
   */
   @ApiOperation({ summary: '新增资源' })
   @ApiBearerAuth() // swagger文档设置token
   @UseGuards(JwtAuthGuard) // 需要jwt鉴权认证
   @Post('/add')
   addUser(@Body() addUserDto: [],@Request() req): Promise<boolean> {
     Logger.log(`新增资源接收参数：${JSON.stringify(addUserDto)}`);
     return this.moduleService.save(addUserDto,req.user);
   }
 
   /**
    * 资源管理-编辑资源
    */
   @ApiOperation({ summary: '编辑资源' })
   @ApiBearerAuth() // swagger文档设置token
   @UseGuards(JwtAuthGuard) // 需要jwt鉴权认证
   @Post('/edit')
   updateUser(@Body() updateUserDto: [],@Request() req): Promise<boolean> {
     Logger.log(`编辑资源接收参数：${JSON.stringify(updateUserDto)}`);
     return this.moduleService.save(updateUserDto,req.user);
   }
 
   /**
    * 资源管理-删除资源
    */
   @Post('/delete')
   deleteUser(@Body() deleteUserDto: []): Promise<boolean> {
     Logger.log(`删除资源接收参数：${JSON.stringify(deleteUserDto)}`);
     return this.moduleService.delete(deleteUserDto);
   }

}
