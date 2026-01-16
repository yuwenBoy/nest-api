import { Transform, TransformFnParams } from 'class-transformer';
import { Column, Entity, PrimaryGeneratedColumn, BaseEntity, BeforeInsert, OneToOne } from 'typeorm';
import { BusinessBaseEntity } from '../common/base.entity';
import {ProductSaleStatusEnum } from 'src/enum/business_enum';

/**
 * description:产品规格表
 * @createTime:2025-3-25 10:00:49
 * @Author:zhao.jian
 */
@Entity("product_spec")
export class ProductSpecEntity extends BusinessBaseEntity { 

    @Column({type:'int', name: 'product_id',comment:'产品ID'})
    productId: number;
    
    @Column({type:'varchar', name: 'weight',comment:'份量如：200克'})
    weight: string;

    @Column({type:'varchar', name: 'name',comment:'份量名称'})
    name: string;

    
    // @Column({type:'varchar', name: 'quantity_unit',comment:'份量单位'})
    // quantityUnit: string;
        
    // @Column({type:'varchar', name: 'quantity_unit_values',comment:'份量单位值'})
    // quantityUnitValues: string;

    @Column({type:'varchar', name: 'barcode',comment:'条形码'})
    barcode: string;

    @Column({
        type: "decimal",
        comment:'价格',
        precision: 10,   // 总位数（含小数点前后）
        scale: 2,        // 小数点后的位数
        nullable: true  // 可选，根据需求设置
      })
    price: string;

    @Column({
        type: "decimal",
        name:'packing_price',
        comment:'打包费',
        precision: 10,   // 总位数（含小数点前后）
        scale: 2,        // 小数点后的位数
        nullable: true  // 可选，根据需求设置
      })
    packingPrice: string;

    // @Column({type:'int', name: 'packing_number',comment:'打包费每几份,默认每一份'})
    // packingNumber:number;

    @Column({type:'enum',default:ProductSaleStatusEnum.UPSALE,enum:ProductSaleStatusEnum, name: 'is_active',comment:'售卖状态'})
    isActive: ProductSaleStatusEnum;

    @Column({type:'int', name: 'stock',comment:'库存'})
    stock:number;

      
    @Column('json', { nullable: true, comment: '单位', name: 'unit_info' })
    unitInfo: any;
}
