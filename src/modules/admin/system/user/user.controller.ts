import { Controller, Get, Post, Body, UseGuards, Req, Logger,Request, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorator/current.user';
// import { OperationDecorator } from 'src/core/security/operation.decorator';
// import { OperationLogInterceptor } from 'src/core/security/operation.intecepotr';
import { JwtAuthGuard } from '../auth/jwt.auth.guard';
import { UserService } from './user.service';

/***
 * author：zhao.jian
 * createTime：2022年12月22日14:27:17
 * description：用户业务控制器模块
 */
@ApiTags('用户管理')
@UseGuards(JwtAuthGuard) // 需要jwt鉴权认证
@Controller('user')
// @UseInterceptors(OperationLogInterceptor) //這裏可變成全局攔截器
export class UserController {
  constructor(private readonly UserService: UserService) {}
  @ApiOperation({ summary: '查询用戶列表' })
  @ApiBearerAuth() // swagger文档设置token
  @UseGuards(AuthGuard('jwt'))
  @Post('/getByCondition')
  // @OperationDecorator('测试123')
  list(@Body() query):Promise<{}> {
    Logger.log(`分页查询接受参数：${JSON.stringify(query)}`);
    return this.UserService.pageQuery(query);
  }

   /**
   * 用户管理-新增用户
   */
   @ApiOperation({ summary: '新增用户' })
   @ApiBearerAuth() // swagger文档设置token
   @Post('/add')
   addUser(@Body() addUserDto: [],@CurrentUser() userInfo): Promise<boolean> {
    console.log('CurrentUser'+JSON.stringify(userInfo.username))
     Logger.log(`增加用户接收参数：${JSON.stringify(addUserDto)}`);
     return this.UserService.save(addUserDto,userInfo.user);
   }
 
   /**
    * 用户管理-编辑用户
    */
   @ApiOperation({ summary: '编辑用户' })
   @UseGuards(JwtAuthGuard) // 需要jwt鉴权认证
   @Post('/edit')
   updateUser(@Body() updateUserDto: [],@Request() req): Promise<boolean> {
     Logger.log(`编辑用户接收参数：${JSON.stringify(updateUserDto)}`);
     console.log('user', req.user)
     return this.UserService.save(updateUserDto,req.user);
   }
 
   /**
    * 用户管理-删除用户
    */
   @Post('/delete')
   deleteUser(@Body() deleteUserDto: []): Promise<boolean> {
     Logger.log(`删除用户接收参数：${JSON.stringify(deleteUserDto)}`);
     return this.UserService.delete(deleteUserDto);
   }
}
