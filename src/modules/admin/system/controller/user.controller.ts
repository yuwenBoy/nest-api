import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Res,
  Logger,
  UseInterceptors,
  HttpStatus,
  HttpCode,
  UploadedFile,

} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { CurrentUser } from 'src/modules/common/collections-permission/decorators/current.user';
import {
  ApiAuth,
  PermissionModule,
} from 'src/modules/common/collections-permission/decorators';
import { PageListVo } from 'src/modules/common/page/pageList';
import { UserService } from 'src/modules/admin/system/service/user.service';
import { DisabledDto } from '../dto/user/disabled.dto';
import { UpdateUserPwdDto } from '../dto/user/updateUserPwd.dto';
import { UserInfoDto } from '../dto/user/userInfo.dto';
import { AuthGuard } from 'src/modules/common/auth/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { join } from 'path';
import * as xlsx  from 'xlsx';

/***
 * author：zhao.jian
 * createTime：2022年12月22日14:27:17
 * description：用户业务控制器模块
 */
@ApiTags('用户管理')
@ApiBearerAuth()
@PermissionModule('用户管理')
@UseGuards(AuthGuard)
// @UseGuards(JwtAuthGuard)
@ApiAuth()
@Controller('user')
export class UserController {
  constructor(
    private readonly UserService: UserService
  ) {}

  /***
   * 获取用户列表
   */
  @ApiOperation({ summary: '查询用户列表', description: '分页查询用户列表' })
  @ApiOkResponse({ type: PageListVo, description: '分页查询用户返回值' })
  @HttpCode(HttpStatus.OK)
  @Post('/getByCondition')
  list(@Body() query): Promise<PageListVo> {
    Logger.log(`分页查询接受参数：${JSON.stringify(query)}`);
    return this.UserService.pageQuery(query);
  }

  /**
   * 用户管理-新增用户
   */
  @ApiOperation({ summary: '新增用户' })
  @Post('/add')
  addUser(
    @Body() addUserDto: [],
    @CurrentUser() userInfo: UserInfoDto,
  ): Promise<boolean> {
    Logger.log(`增加用户接收参数：${JSON.stringify(addUserDto)}`);
    return this.UserService.save(addUserDto, userInfo.username);
  }

  /**
   * 用户管理-编辑用户
   */
  @ApiOperation({ summary: '编辑用户' })
  @Post('/edit')
  updateUser(
    @Body() updateUserDto: [],
    @CurrentUser() userInfo: UserInfoDto,
  ): Promise<boolean> {
    Logger.log(`编辑用户接收参数：${JSON.stringify(updateUserDto)}`);
    return this.UserService.save(updateUserDto, userInfo.username);
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

  /**
   * 用户管理-设置用户状态
   */
  @ApiOperation({ summary: '设置用户状态' })
  @Post('/UpdateUserDisabled')
  updateDisabledById(
    @Body() disabledDto: DisabledDto,
    @CurrentUser() userInfo: UserInfoDto,
  ): Promise<boolean> {
    Logger.log(`设置用户状态接收参数：${JSON.stringify(disabledDto)}`);
    return this.UserService.updateDisabledById(disabledDto, userInfo.username);
  }

  /**
   * 用户管理-修改密码
   */
  @ApiOperation({ summary: '修改密码' })
  @Post('/updateUserPwd')
  updateUserPwd(
    @Body() updateUserPwdDto: UpdateUserPwdDto,
    @CurrentUser() userInfo: UserInfoDto,
  ): Promise<boolean> {
    Logger.log(`修改密码接收参数：${JSON.stringify(updateUserPwdDto)}`);
    return this.UserService.updateUserPwd(updateUserPwdDto, userInfo);
  }

  @Post('/import')
  @ApiOperation({ summary: '导入用户' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async importData(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() userInfo: UserInfoDto,
  ): Promise<any> {
    return await this.UserService.import(file, userInfo.username);
  }

  @Post('/importTemplate')
  @ApiOperation({ summary: '导入用户模板下载' })
  importTemplate(@Res() res:Response) {
     // 创建一个工作簿
     const workbook = xlsx.utils.book_new();
 
     // 创建一个工作表
     const worksheet = xlsx.utils.aoa_to_sheet([
       ['用户名', '姓名','手机号','性别','部门id','职位id'],
       ['super', '赵先生','15120079153','男',3,17],
     ]);
 
     // 将工作表添加到工作簿中
     xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
 
     // 将工作簿保存为 Excel 文件
     const excelBuffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
 
     // 设置响应头，告诉浏览器返回的是一个 Excel 文件
     let filename = `attachment; filename=user_template${new Date().getTime()}.xlsx`
     res.setHeader('Content-Disposition', filename);
     res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
 
     // 将 Excel 文件发送给客户端
     res.status(200).send(excelBuffer);
  }

  @Post('/export')
  @ApiOperation({ summary: '导出用户' })
  async exportData(@Res() res:Response,@Body() query): Promise<void> {
    this.UserService.pageQuery(query).then(data=>{
        let arr2Data = data.content.map(obj=>[obj.id,obj.username,obj.cname]);
         const workbook = xlsx.utils.book_new();
         // let userHeader =['用户id','账号','用户姓名']
         // arr2Data[0].unshift(userHeader)
         console.log('excelData====='+JSON.stringify(arr2Data))
          // 创建一个工作表
         const worksheet = xlsx.utils.aoa_to_sheet(arr2Data);
   
       // 将工作表添加到工作簿中
       xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
   
       // 将工作簿保存为 Excel 文件
       const excelBuffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
   
       // 设置响应头，告诉浏览器返回的是一个 Excel 文件
       res.setHeader('Content-Disposition', 'attachment; filename=export.xlsx');
       res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
   
       // 将 Excel 文件发送给客户端
       res.status(200).send(excelBuffer);
         // return excelData;
     });
  }
}
