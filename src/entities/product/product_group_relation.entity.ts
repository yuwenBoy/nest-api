import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BusinessBaseEntity } from '../common/base.entity';
import { ProductGroupEntity } from './product_group.entity';
/**
 * description:产品分组关联表
 * @createTime:2025-3-14 10:02:19
 * @Author:zhao.jian
 */
@Entity("product_group_relation")
export class ProductGroupRelationEntity extends BusinessBaseEntity{ 

    @Column({type:'int', name: 'product_id',comment:'产品ID'})
    productId: number;

    @Column({type:'int', name: 'group_id',comment:'分组ID'})
    groupId: number;   
}  
