import { Body, Controller,Get,HttpCode,HttpStatus,Logger,Post, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from '../../../common/auth/auth.guard';
import { ApiBearerAuth, ApiTags,ApiOperation, ApiOkResponse } from "@nestjs/swagger";
import { ApiAuth, CurrentUser, PermissionModule } from '../../../common/collections-permission/decorators';
import { BusinessService } from "../service/business.service";
import { PageListVo } from '../../../common/page/pageList';
import { AccountService } from "../service/account.service";
import { userInfo, UserInfo } from "os";
import { UserInfoDto } from "../../system/dto/user/userInfo.dto";
import { StoreService } from "../service/store.service";
import { EmployeeService } from "../service/employee.service";
import { EmployeeEntity } from '../../../../entities/store/employee.entity';


@ApiTags('员工管理')
@ApiBearerAuth() // swagger文档设置token
@PermissionModule('员工管理')
@UseGuards(AuthGuard)
@ApiAuth()
@Controller('employee')
export class EmployeeController {
    constructor(private readonly employeeService: EmployeeService) {}

     /***
      * 获取分页列表
      */
     @ApiOperation({ summary: '获取分页列表', description: '获取分页列表' })
     @ApiOkResponse({ type: PageListVo, description: '获取分页列表' })
     @HttpCode(HttpStatus.OK)
     @Post('/getByCondition')
     pageQuery(@Body() query,@CurrentUser() userInfo: UserInfoDto): Promise<PageListVo> {
       Logger.log(`分页查询接受参数：${JSON.stringify(query)}`);
       return this.employeeService.pageQuery(query,userInfo.business_id);
   }
      
   /**
   * 员工管理-新增员工
   */
   @ApiOperation({ summary: '新增员工' })
   @Post('/add')
   addUser(@Body() employeeData: Partial<EmployeeEntity>,@CurrentUser() userInfo: UserInfoDto): Promise<any> {
     Logger.log(`新增接收参数：${JSON.stringify(employeeData)}`+userInfo.business_id);
     return this.employeeService.create(employeeData,userInfo);
   }
 
//    /**
//     * 员工管理-编辑员工
//     */
//    @ApiOperation({ summary: '编辑员工' })
//    @Post('/edit')
//    updateUser(@Body() entityDto: []): Promise<any> {
//      Logger.log(`编辑接收参数：${JSON.stringify(entityDto)}`);
//      return this.employeeService.create(entityDto);
//    }
 
}