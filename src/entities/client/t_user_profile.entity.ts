import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

/**
 * description:顾客端 - 用户扩展表
 * @author: 不吃辣
 * @createTime:2026-1-23 13:52:32
 */
@Entity("t_user_profile")
export class UserProfileEntity{ 

    @PrimaryColumn({ type: 'bigint' , name: 'user_id',comment:'用户id'})
    userId: number;

    @Column({type:'int', name: 'points',comment:'积分'})
    points: number;
    
    @Column({type:'int', name: 'balance',comment:'余额'})
    balance: number;

    @Column({type:'int', name: 'total_order',comment:'总订单数'})   
    total_order: number;

    @Column({type:'int', name: 'login_count',comment:'登录次数'})
    loginCount: number;

    @UpdateDateColumn({name: 'last_login_time',comment:'最后登录时间'})
    lastLoginTime: Date;

    @Column({type:'int', name: 'total_spent',comment:'总消费金额'})   
    total_spent: number;
}  
