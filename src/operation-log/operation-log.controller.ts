import {
    Controller,
    Get,
    Post,
    Body,
    UseGuards,
    Logger,
    HttpStatus,
    HttpCode,
  } from '@nestjs/common';
  import {
    ApiBearerAuth,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
  } from '@nestjs/swagger';
  import {
    ApiAuth,
    PermissionModule,
  } from 'src/modules/common/collections-permission/decorators';
  import { PageListVo } from 'src/modules/common/page/pageList';
  import { AuthGuard } from 'src/modules/common/auth/auth.guard';
import { OperationLogService } from './operation-log.service';
import { SkipLog } from 'src/common/decorators/skip-log.decorator';
  
  /***
   * author：zhao.jian
   * createTime：2025-4-1 17:08:48
   * description：操作日志控制器模块
   */
  @SkipLog() // 标记该不需控制器不需要记录日志
  @ApiTags('操作日志')
  @ApiBearerAuth()
  @PermissionModule('操作日志')
  @UseGuards(AuthGuard)
  @ApiAuth()
  @Controller('log')   
  export class OperationLogController {
    constructor(
      private readonly operationLogService: OperationLogService
    ) {}
  
    /***
     * 操作日志列表分页查询
     */
    @ApiOperation({ summary: '操作日志列表分页查询', description: '操作日志列表分页查询' })
    @ApiOkResponse({ type: PageListVo, description: '分页查询返回值' })
    @HttpCode(HttpStatus.OK)
    @Post('/getByCondition')
    list(@Body() query): Promise<PageListVo> {
      Logger.log(`分页查询接受参数：${JSON.stringify(query)}`);
      return this.operationLogService.pageQuery(query);
    }
    @Get('/getCityInfo')
    getCityInfo(){
        console.log('前端请求了接口...')
        return this.operationLogService.getCityInfo();
    }
  }
  