import { Column, Entity } from 'typeorm';
import { BusinessBaseEntity } from '../common/base.entity';
/**
 * description:商家配送表
 * @createTime:2025-2-21 15:45:22
 * @Author:zhao.jian
 */
@Entity("store_deliveryarea")
export class StoreDeliveryAreaEntity extends BusinessBaseEntity{ 

    @Column({type:'varchar', name: 'area_name',comment:'配送区域名称（如：市中心）'})
    areaName: String;

    @Column({type:'varchar', name: 'min_delivery_time',comment:'最小配送时间'})
    minDeliveryTime: Date;
    
    @Column({type:'varchar', name: 'max_delivery_time',comment:'最大配送时间'})
    maxDeliveryTime: Date;
     
    @Column({type:'varchar', name: 'delivery_free',comment:'配送费'})
    deliveryFree: Date;

    @Column({type:'int', name: 'store_id',comment:'门店ID'})
    storeId: number;
}  
