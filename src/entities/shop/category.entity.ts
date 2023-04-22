import { Transform, TransformFnParams } from 'class-transformer';
import { Column, Entity, PrimaryGeneratedColumn, BaseEntity, BeforeInsert, OneToOne } from 'typeorm';
import { ZJBaseEntity } from '../common/base.entity';

/**
 * description:商品 品类表哦
 * @createTime:2023-4-22 12:09:52
 * @Author:zhao.jian
 */
@Entity("t_shop_category")
export class CategoryEntity extends ZJBaseEntity { 
    @Column({type:'varchar', name: 'name'})
    name: Number;

    @Column({type:'int', name: 'sort',comment:'排序'})
    sort: Number;

    @Column({type:'int', name: 'parent_id',comment:'父级id'})
    parent_id: Number;

    @Column({type:'int', name: 'is_parent_id',comment:'是否父级'})
    is_parent_id: Number;

    @Column({type:'varchar', name: 'pic',comment:'分类图片'})
    pic: String;

    @Column({type:'int', name: 'uid',comment:'创建人ID'})
    uid: Number;

    @Column({type:'int', name: 'update_id',comment:'更新人ID'})
    update_id: Number;
}
