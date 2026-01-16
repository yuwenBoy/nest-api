import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, JoinColumn, ManyToOne } from 'typeorm';
import { BusinessBaseEntity } from '../common/base.entity';
import { Expose } from 'class-transformer';

/**
 * description:动态属性值表
 * @createTime:2025-3-17 16:01:27
 * @updateTime：2025-3-17 16:01:31
 * @Author:zhao.jian
 */
@Entity("dynamic_attribute_value")
export class DynamicAttributeValueEntity extends BusinessBaseEntity{ 

    @Column({type:'varchar', name: 'value'})
    value: string;

    @Column({type:'int', name: 'attribute_id',comment:'属性ID'})
    attributeId: number;

    @Column({type:'int', name: 'parent_id',comment:'父级id'})
    parent_id: number;

    @Column({type:'int', name: 'sort',comment:'排序'})  
    sort: number;

     /**
      * 下一级属性值
      */
    @Expose({ name: 'children' })
    children: DynamicAttributeValueEntity[] = []; // 定义子级属性值数组

    // 即使不存于数据库，也需声明虚拟字段
    @Expose({ name: 'label' }) // 若使用 class-transformer
    get label(): string {
         return this.value;
    }
}  
