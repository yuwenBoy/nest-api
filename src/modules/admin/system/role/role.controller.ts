import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Query,
  Logger,
  Request
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorator/current.user';
import { PermissionModule } from 'src/modules/common/collections-permission/decorators';
import { JwtAuthGuard } from '../auth/jwt.auth.guard';
// import { Transaction, TransactionManager, EntityManager } from 'typeorm';// 开启事务  
import { RoleService } from './role.service';

/***
 * author：zhao.jian
 * createTime：2023年3月13日16:34:33
 * description：角色管理业务控制器模块
 */
@ApiTags('角色管理')
@ApiBearerAuth() // swagger文档设置token
@PermissionModule('用户管理')
@UseGuards(JwtAuthGuard)
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @ApiOperation({ summary: '角色管理：查询分页列表' })
  @Post('/getByCondition')
  list(@Body() query):Promise<{}> {
    Logger.log(`【角色管理：查询分页列表】分页查询接受参数：${JSON.stringify(query)}`);
    return this.roleService.pageQuery(query);
  }


  @ApiOperation({ summary: '查询全部角色' })
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
  @Post('/setRoles')
  setRoles(@Body() query): Promise<any> {
    console.log('【设置角色】接口，接受前端传递参数：',query);
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


  
   /**
   * 角色管理-新增角色
   */
   @ApiOperation({ summary: '新增角色' })
   @Post('/add')
   addUser(@Body() addUserDto: [],@CurrentUser() userInfo): Promise<boolean> {
     Logger.log(`新增角色接收参数：${JSON.stringify(addUserDto)}`);
     return this.roleService.save(addUserDto,userInfo.username);
   }
 
   /**
    * 角色管理-编辑角色
    */
   @ApiOperation({ summary: '编辑角色' })
   @Post('/edit')
   updateUser(@Body() updateUserDto: [],@CurrentUser() userInfo): Promise<boolean> {
     Logger.log(`编辑角色接收参数：${JSON.stringify(updateUserDto)}`);
     return this.roleService.save(updateUserDto,userInfo.username);
   }
 
   /**
    * 角色管理-删除角色
    */
   @ApiOperation({ summary: '删除角色' })
   @Post('/delete')
   deleteUser(@Body() deleteUserDto: []): Promise<boolean> {
     Logger.log(`删除用户接收参数：${JSON.stringify(deleteUserDto)}`);
     return this.roleService.delete(deleteUserDto);
   }
}
