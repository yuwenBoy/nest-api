import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BusinessBaseEntity } from '../common/base.entity';
/**
 * description:门店产品关联表
 * @createTime:2025-3-14 10:06:02
 * @Author:zhao.jian
 */
@Entity("store_product_relation")
export class StoreProductRelationEntity extends BusinessBaseEntity{ 

    @Column({type:'int', name: 'store_id',comment:'门店ID'})
    storeId: number;

    @Column({type:'int', name: 'product_spec_id',comment:'产品规格ID'})
    productSpecId: number;    
    
    
    @Column({
        type: "decimal",
        precision: 10,
        scale: 2
        ,comment:'价格'
      })
    price: number;

    
    @Column({type:'int', name: 'stock',comment:'库存'})
    stock: number;  

    // @ManyToOne(() => BusinessEntity, (merchant) => merchant.id)
    // @JoinColumn({ name: 'product_id' }) // 明确指定外键字段名
    // merchant: BusinessEntity;
  
    // @ManyToOne(() => BusinessCategoryEntity, (category) => category.id)
    // @JoinColumn({ name: 'category_id' }) // 明确指定外键字段名
    // category: BusinessCategoryEntity;
}  
