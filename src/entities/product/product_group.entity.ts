import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, JoinColumn, ManyToOne } from 'typeorm';
import { BusinessBaseEntity } from '../common/base.entity';
/**
 * description:产品菜单分组表
 * @createTime:2025-3-1 21:05:05
 * @updateTime：2025-3-7 11:19:03
 * @Author:zhao.jian
 */
@Entity("product_group")
export class ProductGroupEntity extends BusinessBaseEntity{ 

    @Column({type:'varchar', name: 'name'})
    name: String;

    @Column({type:'int', name: 'sort',comment:'排序'})
    sort: number;

    @Column({type:'int', name: 'store_id',comment:'门店ID'})
    storeId: number;

    @Column({type:'varchar', name: 'description',comment:'分类描述'})
    description: String;
}  
