import { ApiProperty } from '@nestjs/swagger';

/**
 * 在线日志查询DTO
 */
export class OnlineLogQueryDto {
  @ApiProperty({ description: '页码', required: false, example: 1 })
  page?: number;

  @ApiProperty({ description: '每页条数', required: false, example: 10 })
  size?: number;

  @ApiProperty({ description: '操作人', required: false })
  operator?: string;

  @ApiProperty({ description: '请求路径', required: false })
  requestPath?: string;

  @ApiProperty({ description: '请求方法', required: false })
  requestMethod?: string;

  @ApiProperty({ description: '开始时间', required: false })
  startTime?: string;

  @ApiProperty({ description: '结束时间', required: false })
  endTime?: string;

  @ApiProperty({ description: '用户ID', required: false })
  userId?: number;

  @ApiProperty({ description: '端类型', required: false })
  appType?: number;

  @ApiProperty({ description: '排序字段', required: false, example: 'id' })
  sort?: string;

  @ApiProperty({ description: '在线状态', required: false, example: 'online' })
  status?: string;

  @ApiProperty({ description: '用户名', required: false })
  username?: string;

  @ApiProperty({ description: 'IP地址', required: false })
  ip?: string;
}
