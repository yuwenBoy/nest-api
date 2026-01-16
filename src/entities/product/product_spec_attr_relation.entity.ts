import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BusinessBaseEntity } from '../common/base.entity';
/**
 * description:产品规格属性关联表
 * @createTime:2025-3-31 17:09:38
 * @Author:zhao.jian
 */
@Entity("product_spec_attr_relation")
export class ProductSpecAttrRelationEntity extends BusinessBaseEntity{ 

    @Column({type:'int', name: 'product_id',comment:'产品ID'})
    productId: number;
    
    @Column({type:'int', name: 'product_spec_id',comment:'产品规格ID'})
    productSpecId: number;

    // @Column({type:'int', name: 'spec_attr_id',comment:'产品规格属性ID'})
    // specAttrId: number;     

    @Column('json', { nullable: true, comment: '属性选项json', name: 'attribute_option_json' })
    attributeOptionJson: any; 
}  
