import { Column, Entity } from 'typeorm';
import { BusinessBaseEntity } from '../common/base.entity';

/**
 * description:产品规格属性选项表
 * @createTime:2025-3-28 15:15:54
 * @Author:zhao.jian
 */
@Entity("product_spec_attroption")
export class ProductSpecAttrOptionEntity extends BusinessBaseEntity { 
    
    @Column({type:'varchar', name: 'name',comment:'选项名称'})
    name: string;

    @Column({type:'int', name: 'product_spec_attrId',comment:'规格属性ID'})
    productSpecAttrId: number;
    
    @Column({type:'int', name: 'sale_status',comment:'在售、停售'})
    saleStatus: number;

    // @Column({
    //         name:'price_adjustment',
    //         type: "decimal",
    //         comment:'加料价格',
    //         precision: 10,   // 总位数（含小数点前后）
    //         scale: 2,        // 小数点后的位数
    //         nullable: true  // 可选，根据需求设置
    // })
    // priceAdjustment: string;
}
