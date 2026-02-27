import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { BusinessBaseEntity } from '../common/base.entity';
import { BusinessCategoryRelationEntity } from './business_category_relation.entity';

/**
 * description:商家 品类表
 * @createTime:2025-1-17 17:09:32
 * @Author:zhao.jian
 */
@Entity("businesscategory")
export class BusinessCategoryEntity extends BusinessBaseEntity{ 

    @Column({type:'varchar', name: 'category_name'})
    name: String;

    @Column({type:'int', name: 'sort',comment:'排序'})
    sort: number;

    @Column({type:'int', name: 'parent_id',comment:'父级id'})   
    parent_id: number;

    @Column({type:'char', name: 'is_parent',comment:'是否父级'})
    is_parent: number;

    @Column({type:'varchar', name: 'description',comment:'分类描述'})
    description: String;

    @OneToMany(() => BusinessCategoryRelationEntity, (merchantCategory) => merchantCategory.categoryId)
    merchants: BusinessCategoryRelationEntity[];
}  
