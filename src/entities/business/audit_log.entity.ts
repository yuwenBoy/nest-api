import { Column, Entity } from 'typeorm';
import { BusinessBaseEntity } from '../common/base.entity';
import { AuditStatusEnum, AuditTargetType } from 'src/enum/audit_enum';
import { Transform, TransformFnParams } from 'class-transformer';
import { formatTime } from 'src/utils/date';
/**
 * description:审核记录表
 * @author: zhao.jian
 * @date: 2026-3-10 14:28:15
 */
@Entity('audit_log')
export class AuditLogEntity extends BusinessBaseEntity {
  @Column({ name: 'targetId', comment: '目标ID（商家ID/门店ID/骑手ID等）' })
  targetId: number;

  @Column({ 
    name: 'targetType', 
    type: 'int',
    enum: AuditTargetType,
    comment: '目标类型（1=商家，2=门店信息修改，3=门店头像修改，4=商品，5=骑手）' 
  })
  targetType: AuditTargetType;

  @Column({
    name: 'status',
    type: 'int',
    default: AuditStatusEnum.PENDING,
    enum: AuditStatusEnum,
    comment: '审核状态（0=待审核，1=审核通过，2=审核驳回）',
  })
  status: AuditStatusEnum;

  @Column({ type: 'json', name: 'reason', comment: '审核不通过原因' })
  reason?: String;

  @Column({
    name: 'before_data',
    type: 'json',
    nullable: true,
    comment: '修改前数据',
  })
  beforeData: Record<string, any>;

  @Column({
    name: 'after_data',
    type: 'json',
    nullable: true,
    comment: '修改后数据',
  })
  afterData: Record<string, any>;

  @Column({ name: 'operatorId', nullable: true, comment: '审核人ID' })
  operatorId: number;

  @Column({ name: 'auditAt', nullable: true, comment: '审核时间' })
  @Transform((row: TransformFnParams) => {
    let timestamp: any = new Date(row.value);
    return formatTime(timestamp / 1000);
  })
  auditAt: Date;

  @Column({ name: 'applicantId', comment: '申请人ID（商家）' })
  applicantId: number;
}
