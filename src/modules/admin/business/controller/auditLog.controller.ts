import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/modules/common/auth/auth.guard';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiOkResponse,
} from '@nestjs/swagger';
import {
  ApiAuth,
  CurrentUser,
  PermissionModule,
} from 'src/modules/common/collections-permission/decorators';
import { AuditLogService } from '../service/auditLog.service';
import { PageListVo } from 'src/modules/common/page/pageList';
import { SkipLog } from 'src/common/decorators/skip-log.decorator';
import { AuditRejectDto } from '../dto/AuditRejectDto';
import { UserInfoDto } from '../../system/dto/user/userInfo.dto';

@ApiTags('审核记录管理')
@ApiBearerAuth() // swagger文档设置token
@PermissionModule('审核记录管理')
@UseGuards(AuthGuard)
@ApiAuth()
@Controller('auditLog')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  /***
   * 获取审核记录列表
   */
  @SkipLog()
  @ApiOperation({
    summary: '获取审核记录列表',
    description: '获取审核记录列表',
  })
  @ApiOkResponse({ type: PageListVo, description: '获取审核记录列表' })
  @HttpCode(HttpStatus.OK)
  @Post('list')
  getAuditLogList(@Body() query): Promise<PageListVo> {
    return this.auditLogService.pageAuditLogQuery(query);
  }

  // 获取审核记录详情
  @Get('detail/:id')
  async getAuditLogDetail(@Param('id') id: number) {
    return this.auditLogService.auditLogDetail(id);
  }

   @ApiOkResponse({ type: AuditRejectDto, description: '审核驳回' })
  // 审核驳回
  @Post('reject')
  async rejectAuditLog(@Body() dto: AuditRejectDto,@CurrentUser() user:UserInfoDto) {
    if(!user.id){
        return { success: false, message: '操作人ID不能为空且必须为数字' };
    }
    return this.auditLogService.rejectAuditLog(dto,user.id);
  }
}
