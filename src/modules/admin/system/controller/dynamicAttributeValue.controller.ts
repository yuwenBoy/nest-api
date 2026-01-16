import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Query,
  Logger,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PermissionModule } from 'src/modules/common/collections-permission/decorators';
import { PageListVo } from 'src/modules/common/page/pageList';
import { AuthGuard } from 'src/modules/common/auth/auth.guard';
import { ApiAuth } from 'src/modules/common/collections-permission/decorators/api.auth';
import { DynamicAttributeValueService } from '../service/dynamicAttributeValue.service';
import { SkipLog } from 'src/common/decorators/skip-log.decorator';
// import { Transaction, TransactionManager, EntityManager } from 'typeorm';// 开启事务

/***
 * author：zhao.jian
 * createTime：2025-3-18 10:34:17
 * description：动态属性值值控制器模块
 */
@SkipLog()
@ApiTags('动态属性值值管理')
@ApiBearerAuth() // swagger文档设置token
@PermissionModule('动态属性值值管理')
@UseGuards(AuthGuard)
@ApiAuth()
@Controller('dynamicAttributeValue')
export class dynamicAttributeValueController {
  constructor(private readonly dynamicAttributeValueService: DynamicAttributeValueService) {}

  @ApiOperation({ summary: '动态属性值：查询分页列表' })
  @Post('/getByCondition')
  list(@Body() query): Promise<PageListVo> {
    Logger.log(
      `【动态属性值值：查询分页列表】分页查询接受参数：${JSON.stringify(query)}`,
    );
    return this.dynamicAttributeValueService.pageQuery(query);
  }
 
  /**
   * 属性值管理-新增属性值
   */
  @ApiOperation({ summary: '新增属性值' })
  @Post('/add')
  addUser(@Body() addUserDto: []): Promise<boolean> {
    Logger.log(`新增属性值接收参数：${JSON.stringify(addUserDto)}`);
    return this.dynamicAttributeValueService.save(addUserDto);
  }

  /**
   * 属性值管理-编辑属性值
   */
  @ApiOperation({ summary: '编辑属性值' })
  @Post('/edit')
  updateUser(
    @Body() updateUserDto: []
  ): Promise<boolean> {
    Logger.log(`编辑属性值接收参数：${JSON.stringify(updateUserDto)}`);
    return this.dynamicAttributeValueService.save(updateUserDto);
  }

  /**
   * 属性值管理-删除属性值
   */
  @ApiOperation({ summary: '删除属性值' })
  @Post('/delete')
  deleteUser(@Body() deleteUserDto: []): Promise<boolean> {
    Logger.log(`删除用户接收参数：${JSON.stringify(deleteUserDto)}`);
    return this.dynamicAttributeValueService.delete(deleteUserDto);
  }

  @ApiOperation({ summary: '查询所有品类' })
  @Get('/getCategoryAll')
  getCategoryAll(@Query() query):Promise<any> {
    return  this.dynamicAttributeValueService.getCategoryAll(query.attributeId);
  }

}
