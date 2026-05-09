import { ApiProperty } from '@nestjs/swagger';

/**
 * 异常日志查询DTO
 */
export class ExceptionLogQueryDto {
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

  @ApiProperty({ description: '日志级别', required: false })
  logLevel?: number;

  @ApiProperty({ description: '状态码', required: false })
  statusCode?: number;
}
