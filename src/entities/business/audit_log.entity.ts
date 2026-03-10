
import { Column, Entity } from 'typeorm';
import { BusinessBaseEntity } from '../common/base.entity';
import { AuditLogStatusEnum } from 'src/enum/business_enum';

// 审核目标类型
export enum AuditTargetType {
  STORE_MODIFY = 'store_modify', // 门店信息修改
  STORE_QUALIFICATION = 'store_qualification', // 门店资质审核
}
/**
 * description:审核记录表
 * @author: zhao.jian
 * @date: 2026-3-10 14:28:15
 */
@Entity("audit_log")
export class AuditLogEntity extends BusinessBaseEntity{ 

    @Column({ name: 'targetId', comment: '目标ID（门店ID）' })
    targetId: number;

    @Column({ name: 'targetType', comment: '目标类型' })
    targetType: AuditTargetType;

    @Column({ name: 'status', default: AuditLogStatusEnum.PENDING, enum: AuditLogStatusEnum, comment: '审核状态' })
    status: AuditLogStatusEnum;

    @Column({type:'varchar', name: 'reason',comment:'审核不通过原因'})
    reason?: String;

    @Column({ name: 'before_data', type: 'json', nullable: true, comment: '修改前数据' })
    beforeData: Record<string, any>;

    @Column({ name: 'after_data', type: 'json', nullable: true, comment: '修改后数据' })
    afterData: Record<string, any>;

    @Column({ name: 'operatorId', nullable: true, comment: '审核人ID' })
    operatorId: number;

    @Column({ name: 'auditAt', nullable: true, comment: '审核时间' })
    auditAt: Date;

    @Column({ name: 'applicantId', comment: '申请人ID（商家）' })
    applicantId: number;
}  
