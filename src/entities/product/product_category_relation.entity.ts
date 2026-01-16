import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BusinessBaseEntity } from '../common/base.entity';
/**
 * description:产品类别关联表
 * @createTime:2025-3-14 09:55:47
 * @Author:zhao.jian
 */
@Entity("product_category_relation")
export class ProductCategoryRelationEntity extends BusinessBaseEntity{ 
 
    @Column({type:'int', name: 'product_id',comment:'产品ID'})
    productId: number;

    @Column({type:'int', name: 'product_category_id',comment:'产品分类ID'})
    productCategoryId: number;   
    
    @Column({type:'int', name: 'level',default:1, comment:'类目级别'})
    level: number;


    // @ManyToOne(() => BusinessEntity, (merchant) => merchant.id)
    // @JoinColumn({ name: 'product_id' }) // 明确指定外键字段名
    // merchant: BusinessEntity;
  
    // @ManyToOne(() => BusinessCategoryEntity, (category) => category.id)
    // @JoinColumn({ name: 'category_id' }) // 明确指定外键字段名
    // category: BusinessCategoryEntity;
}  
