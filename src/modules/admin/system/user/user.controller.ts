import { Controller, Get, Post, Body, UseGuards, Req, Logger,Request, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorator/current.user';
import { PermissionModule } from 'src/modules/common/collections-permission/decorators';
import { JwtAuthGuard } from '../auth/jwt.auth.guard';
import { UserService } from './user.service';

/***
 * author：zhao.jian
 * createTime：2022年12月22日14:27:17
 * description：用户业务控制器模块
 */
@ApiTags('用户管理')
@ApiBearerAuth()
@PermissionModule('用户管理')
@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly UserService: UserService) {}


  @ApiOperation({ summary: '查询用户列表' })
  @Post('/getByCondition')
  list(@Body() query):Promise<{}> {
    Logger.log(`分页查询接受参数：${JSON.stringify(query)}`);
    return this.UserService.pageQuery(query);
  }

   /**
   * 用户管理-新增用户
   */
   @ApiOperation({ summary: '新增用户' })
   @Post('/add')
   addUser(@Body() addUserDto: [],@CurrentUser() userInfo): Promise<boolean> {
     Logger.log(`增加用户接收参数：${JSON.stringify(addUserDto)}`);
     return this.UserService.save(addUserDto,userInfo.username);
   }
 
   /**
    * 用户管理-编辑用户
    */
   @ApiOperation({ summary: '编辑用户' })
   @Post('/edit')
   updateUser(@Body() updateUserDto: [],@CurrentUser() userInfo): Promise<boolean> {
     Logger.log(`编辑用户接收参数：${JSON.stringify(updateUserDto)}`);
     return this.UserService.save(updateUserDto,userInfo.username);
   }
 
   /**
    * 用户管理-删除用户
    */
   @ApiOperation({ summary: '删除用户' })
   @Post('/delete')
   deleteUser(@Body() deleteUserDto: []): Promise<boolean> {
     Logger.log(`删除用户接收参数：${JSON.stringify(deleteUserDto)}`);
     return this.UserService.delete(deleteUserDto);
   }
}
