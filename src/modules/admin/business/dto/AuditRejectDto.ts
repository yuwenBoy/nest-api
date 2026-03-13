import { IsNotEmpty, IsNumber, IsObject } from "class-validator";



/**
 * 审核驳回DTO（匹配前端传参结构）
 */
export class AuditRejectDto {
  /** 审核记录ID */
  @IsNotEmpty({ message: '审核记录ID不能为空' })
  @IsNumber({}, { message: '审核记录ID必须为数字' })
  auditId: number;

  /** 结构化驳回原因（JSON对象） */
  @IsNotEmpty({ message: '驳回原因不能为空' })
  @IsObject({ message: '驳回原因必须为合法的JSON对象' })
  rejectReason: Record<string, any>;
}