
import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { BusinessBaseEntity } from '../common/base.entity';
import { BusinessAuditStatusEnum, BusinessStatusEnum } from 'src/enum/business_enum';
import { BusinessEntity } from './business.entity';
/**
 * description:商家审核表
 * @createTime:2025-2-21 14:56:17
 * @Author:zhao.jian
 */
@Entity("business_audit")
export class BusinessAuditEntity extends BusinessBaseEntity{ 

    @Column({type:'varchar', name: 'reason',comment:'审核不通过原因'})
    reason?: String;

    @Column({type:'int', name: 'business_id',comment:'商家ID'})
    business_id:number;
    
    @Column({type:'enum',default:BusinessAuditStatusEnum.APPLYIN,enum:BusinessAuditStatusEnum, name: 'status',comment:'审核状态'})
    status: BusinessAuditStatusEnum;
    
    @OneToOne(() => BusinessEntity, business => business.audit, {
        eager: false,
        cascade: false,
      })
      @JoinColumn({ name: 'business_id' }) // 明确指定外键字段名
      business: BusinessEntity; 
}  
