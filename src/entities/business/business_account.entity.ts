

import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BusinessBaseEntity } from '../common/base.entity';
import { BusinessEntity } from './business.entity';

/**
 * description:商家账户信息表（用于存储商家银行账户、支付宝、微信等收款账户信息）
 * @createTime:2025-2-25 11:32:58
 * @Author:zhao.jian
 * @note: 此表记录商家的收款账户信息，包括银行卡、对公账户、支付宝、微信等
 */
@Entity("business_account")
export class BusinessAccountEntity extends BusinessBaseEntity {

    @Column({type:'int', name: 'account_type',comment:'账户类型：1个人银行卡 2对公账户 3支付宝 4微信'})
    accountType: number;

    @Column({type:'varchar', name: 'account_name',comment:'账户名（个人姓名或企业名称）'})
    accountName: String;

    @Column({type:'varchar', name: 'bank_name',comment:'银行名称（如：中国工商银行），支付宝/微信时为空'})
    bankName:String;

    @Column({type:'varchar', name: 'bank_account',comment:'银行卡号/支付宝/微信账号'})
    bankAccount:String;

    @Column({type:'int', name: 'status',comment:'账户状态：0待完善 1正常 2冻结'})
    status:number;

    @Column({type:'int', name: 'is_default',comment:'是否默认账户：0否 1是'})
    isDefault:number;

    @Column({type:'int', name: 'business_id',comment:'关联商家ID'})
    business_id:number;

    /**
     * 关联商家
     */
    @ManyToOne(() => BusinessEntity, {
        eager: false,
        cascade: false,
    })
    @JoinColumn({ name: 'business_id' })
    business: BusinessEntity;
}
