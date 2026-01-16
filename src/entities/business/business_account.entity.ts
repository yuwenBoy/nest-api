
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

    @Column({type:'varchar', name: 'email',comment:'邮箱'})
    email: String;

    @Column({type:'varchar', name: 'username',comment:'账户'})
    userName: String;

    @Column({type:'varchar', name: 'password',comment:'密码'})
    password:String;
    
    @Column({type:'int', name: 'business_id',comment:'商家ID'})
    business_id:number;
    
    @OneToOne(() => BusinessEntity, business => business.audit, {
        eager: false,
        cascade: false,
      })
      @JoinColumn({ name: 'business_id' }) // 明确指定外键字段名
      business: BusinessEntity; 
}  
