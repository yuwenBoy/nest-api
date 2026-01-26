
import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { BusinessBaseEntity } from '../common/base.entity';
import { BusinessEntity } from './business.entity';
/**
 * description:商家账户信息表
 * @createTime:2025-2-25 11:32:58
 * @Author:zhao.jian
 */
@Entity("business_account")
export class BusinessAccountEntity extends BusinessBaseEntity{ 

    @Column({type:'int', name: 'account_type',comment:'1个人银行卡 2对公账户 3支付宝 4微信'})
    accountType: number;

    @Column({type:'varchar', name: 'account_name',comment:'账户名（真实姓名）'})
    accountName: String;

    @Column({type:'varchar', name: 'bank_name',comment:'银行名称（如：中国工商银行）'})
    bankName:String;

    @Column({type:'varchar', name: 'bank_account',comment:'银行卡号'})
    bankAccount:String;

    @Column({type:'int', name: 'status',comment:'状态 0待完善 1正常 2冻结'})
    status:number;
    
    @Column({type:'int', name: 'is_default',comment:'是否默认 0否 1是'})
    isDefault:number;

    @Column({type:'int', name: 'business_id',comment:'商家ID'})
    business_id:number;
    
    @OneToOne(() => BusinessEntity, business => business.audit, {
        eager: false,
        cascade: false,
      })
      @JoinColumn({ name: 'business_id' }) // 明确指定外键字段名
      business: BusinessEntity; 
}  
