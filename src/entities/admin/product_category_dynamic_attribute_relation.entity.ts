import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, JoinColumn, ManyToOne } from 'typeorm';
import { BusinessBaseEntity } from '../common/base.entity';

/**
 * description:产品分类动态属性关联表
 * @createTime:2025-3-18 09:28:07
 * @updateTime：2025-3-18 09:28:11
 * @Author:zhao.jian
 */
@Entity("product_category_dynamic_attribute_relation")
export class productCategoryDynamicAttributeRelationEntity extends BusinessBaseEntity{ 

    @Column({type:'int', name: 'dynamic_attribute_id',comment:'动态属性id'})
    dynamicAttributeId: number;

    @Column({type:'int', name: 'product_category_id',comment:'分类id'})
    productCategoryId: number;
}  
