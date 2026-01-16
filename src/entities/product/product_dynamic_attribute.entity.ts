import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, JoinColumn, ManyToOne } from 'typeorm';
import { BusinessBaseEntity } from '../common/base.entity';

/**
 * description:产品属性表 用于存储不同产品详情的属性
 * @createTime:2025-3-18 09:40:24
 * @updateTime：2025-3-18 09:40:28
 * @Author:zhao.jian
 */
@Entity("product_dynamic_attribute")
export class ProductDynamicAttributeEntity extends BusinessBaseEntity{ 

    @Column({type:'int', name: 'product_id',comment:'产品ID'})
    productId: number;

    @Column({type:'varchar', name: 'attribute_value_id',comment:'动态属性选项ID'})
    attributeValueId: string;

    @Column({type:'varchar', name: 'attribute_id',comment:'动态属性ID'})
    attributeId: number;
}  
