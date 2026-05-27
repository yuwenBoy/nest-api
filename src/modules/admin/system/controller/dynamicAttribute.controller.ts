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
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PermissionModule } from '../../../common/collections-permission/decorators';
import { PageListVo } from '../../../common/page/pageList';
import { AuthGuard } from '../../../common/auth/auth.guard';
import { ApiAuth } from '../../../common/collections-permission/decorators/api.auth';
import { DynamicAttributeService } from '../service/dynamicAttribute.service';
import { SkipLog } from '../../../../common/decorators/skip-log.decorator';
// import { Transaction, TransactionManager, EntityManager } from 'typeorm';// 开启事务

/***
 * author：zhao.jian
 * createTime：2025-3-17 16:20:57
 * description：动态属性控制器模块
 */
@SkipLog()
@ApiTags('动态属性管理')
@ApiBearerAuth() // swagger文档设置token
@PermissionModule('动态属性管理')
@UseGuards(AuthGuard)
@ApiAuth()
@Controller('dynamicAttribute')
export class dynamicAttributeController {
  constructor(private readonly dynamicAttributeService: DynamicAttributeService) {}

  @ApiOperation({ summary: '动态属性：查询分页列表' })
  @Post('/getByCondition')
  list(@Body() query): Promise<PageListVo> {
    Logger.log(
      `【动态属性：查询分页列表】分页查询接受参数：${JSON.stringify(query)}`,
    );
    return this.dynamicAttributeService.pageQuery(query);
  }
 
  /**
   * 属性管理-新增属性
   */
  @ApiOperation({ summary: '新增属性' })
  @Post('/add')
  addUser(@Body() addUserDto: []): Promise<boolean> {
    Logger.log(`新增属性接收参数：${JSON.stringify(addUserDto)}`);
    return this.dynamicAttributeService.save(addUserDto);
  }

  /**
   * 属性管理-编辑属性
   */
  @ApiOperation({ summary: '编辑属性' })
  @Post('/edit')
  updateUser(
    @Body() updateUserDto: []
  ): Promise<boolean> {
    Logger.log(`编辑属性接收参数：${JSON.stringify(updateUserDto)}`);
    return this.dynamicAttributeService.save(updateUserDto);
  }

  /**
   * 属性管理-删除属性
   */
  @ApiOperation({ summary: '删除属性' })
  @Post('/delete')
  deleteUser(@Body() deleteUserDto: []): Promise<boolean> {
    Logger.log(`删除用户接收参数：${JSON.stringify(deleteUserDto)}`);
    return this.dynamicAttributeService.delete(deleteUserDto);
  }

  
  @ApiOperation({ summary: '关联产品分类' })
  @Post('/relevanceProductCategory')
  relevanceProductCategory(@Body() request): Promise<any> {
    Logger.log('关联产品分类接受参数：' + request);
    try {
        return this.dynamicAttributeService.relevanceProductCategory(request);
    } catch (error) {
      Logger.error('接口dynamicAttribute/relevanceProductCategory错误，原因:' + error);
    }
  }

  @ApiOperation({ summary: '移除产品分类' })
  @Post('/batchRemove')
  async batchRemove(@Body() request): Promise<boolean> {
    try {
      return this.dynamicAttributeService.batchRemove(request);
    } catch (error) {
      console.error('Error removing associations:', error);
    }
  }

   /**
   * 属性管理-根据商品类目末级分类ID查询商品详情属性  
   */
   @ApiOperation({ summary: '根据商品类目末级分类ID查询商品详情属性' })
   @Post('/getDynamicAttributeByCategoryId')
   getDynamicAttributeByCategoryId(@Body() request): Promise<any> {
     return this.dynamicAttributeService.getDynamicAttributeByCategoryId(request);   
   }
}
