import {
    Controller,
    Get,
    Post,
    Body,
    UseGuards,
    Logger,
    HttpStatus,
    HttpCode,
    Param,
    Query,
    Res,
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
import { OnlineLogQueryDto } from './dto/online-log-query.dto';
import { ExceptionLogQueryDto } from './dto/exception-log-query.dto';
import { Response } from 'express';
  
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

    /***
     * 在线日志列表分页查询
     */
    @ApiOperation({ summary: '在线日志列表分页查询', description: '在线日志列表分页查询' })
    @ApiOkResponse({ type: PageListVo, description: '在线日志分页查询返回值' })
    @HttpCode(HttpStatus.OK)
    @Post('/online/logs')
    getOnlineLogs(@Body() query: OnlineLogQueryDto): Promise<PageListVo> {
      Logger.log(`在线日志分页查询接受参数：${JSON.stringify(query)}`);
      return this.operationLogService.getOnlineLogs(query);
    }

    /***
     * 异常日志列表分页查询
     */
    @ApiOperation({ summary: '异常日志列表分页查询', description: '异常日志列表分页查询' })
    @ApiOkResponse({ type: PageListVo, description: '异常日志分页查询返回值' })
    @HttpCode(HttpStatus.OK)
    @Post('/exception/logs')
    getExceptionLogs(@Body() query: ExceptionLogQueryDto): Promise<PageListVo> {
      Logger.log(`异常日志分页查询接受参数：${JSON.stringify(query)}`);
      return this.operationLogService.getExceptionLogs(query);
    }

    /***
     * 获取在线统计数据
     */
    @ApiOperation({ summary: '获取在线统计数据', description: '获取在线人数、今日登录、总记录数、历史峰值等统计数据' })
    @ApiOkResponse({ description: '在线统计数据' })
    @HttpCode(HttpStatus.OK)
    @Get('/online/stats')
    getOnlineStats(): Promise<any> {
      Logger.log('获取在线统计数据');
      return this.operationLogService.getOnlineStats();
    }

    /***
     * 获取在线用户列表
     */
    @ApiOperation({ summary: '获取在线用户列表', description: '获取当前在线的所有用户列表' })
    @ApiOkResponse({ description: '在线用户列表' })
    @HttpCode(HttpStatus.OK)
    @Post('/online/list')
    getOnlineUserList(@Body() query): Promise<any> {
      Logger.log(`获取在线用户列表，参数：${JSON.stringify(query)}`);
      return this.operationLogService.getOnlineUserList(query);
    }

    /***
     * 强制用户下线
     */
    @ApiOperation({ summary: '强制用户下线', description: '根据用户ID强制指定用户下线' })
    @HttpCode(HttpStatus.OK)
    @Post('/online/kick')
    kickUser(@Body() params): Promise<any> {
      Logger.log(`强制用户下线，参数：${JSON.stringify(params)}`);
      return this.operationLogService.kickUser(params);
    }

    /***
     * 获取用户操作日志
     */
    @ApiOperation({ summary: '获取用户操作日志', description: '获取指定用户的操作日志记录' })
    @HttpCode(HttpStatus.OK)
    @Post('/online/operLog')
    getUserOperLog(@Body() query): Promise<any> {
      Logger.log(`获取用户操作日志，参数：${JSON.stringify(query)}`);
      return this.operationLogService.getUserOperLog(query);
    }

    /***
     * 强制多人下线
     */
    @ApiOperation({ summary: '强制多人下线', description: '批量强制多个用户下线' })
    @HttpCode(HttpStatus.OK)
    @Post('/online/kickBatch')
    kickUsers(@Body() params): Promise<any> {
      Logger.log(`强制多人下线，参数：${JSON.stringify(params)}`);
      return this.operationLogService.kickUsers(params);
    }

    /***
     * 获取异常日志列表
     */
    @ApiOperation({ summary: '获取异常日志列表', description: '获取异常日志列表' })
     @HttpCode(HttpStatus.OK)
    @Post('/error/list')
    getErrorLogList(@Body() params): Promise<any> {
      Logger.log(`获取异常日志列表，参数：${JSON.stringify(params)}`);
      return this.operationLogService.getErrorLogList(params);
    }

    /***
     * 获取异常日志详情
     */
    @ApiOperation({ summary: '获取异常日志详情', description: '获取异常日志详情' })
    @Get('/error/:id')
    getErrorLogDetail(@Param('id') id: string): Promise<any> {
      Logger.log(`获取异常日志详情，ID：${id}`);
      return this.operationLogService.getErrorLogDetail(id);
    }

    /***
     * 删除异常日志
     */
    @ApiOperation({ summary: '删除异常日志', description: '删除指定的异常日志' })
    @HttpCode(HttpStatus.OK)
    @Post('/error/delete')
    delErrorLog(@Body() params): Promise<any> {
      Logger.log(`删除异常日志，参数：${JSON.stringify(params)}`);
      return this.operationLogService.delErrorLog(params);
    }

    /***
     * 清空异常日志
     */
    @ApiOperation({ summary: '清空异常日志', description: '清空所有异常日志' })
    @HttpCode(HttpStatus.OK)
    @Post('/error/clear')
    clearErrorLog(): Promise<any> {
      Logger.log('清空异常日志');
      return this.operationLogService.clearErrorLog();
    }

    /***
     * 导出异常日志
     */
    @ApiOperation({ summary: '导出异常日志', description: '导出异常日志为文件' })
    @HttpCode(HttpStatus.OK)
    @Post('/error/export')
    async exportErrorLog(@Body() params, @Res() res: Response): Promise<any> {
      Logger.log(`导出异常日志，参数：${JSON.stringify(params)}`);
      return this.operationLogService.exportErrorLog(params, res);
    }
  }
