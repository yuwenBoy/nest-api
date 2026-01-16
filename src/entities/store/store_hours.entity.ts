import { Column, Entity } from 'typeorm';
import { BusinessBaseEntity } from '../common/base.entity';
/**
 * description:门店营业时间表
 * @createTime:2025-2-21 15:45:22
 * @Author:zhao.jian
 */
@Entity("store_hours")
export class StoreHoursEntity extends BusinessBaseEntity{ 

    @Column({type:'varchar', name: 'day_of_week',comment:'星期几'})
    dayOfWeek: String;

    @Column({type:'varchar', name: 'start_time',comment:'商家营业开始时间'})
    startTime: Date;
    
    @Column({type:'varchar', name: 'end_time',comment:'商家营业结束时间'})
    endTime: Date;

    @Column({type:'int', name: 'store_id',comment:'门店ID'})
    storeId: number;
}  
   