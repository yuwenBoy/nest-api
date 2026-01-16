import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BusinessBaseEntity } from '../common/base.entity';
import { BusinessEntity } from '../business/business.entity';
import { Expose } from 'class-transformer';

/**
 * description:产品类目表
 * @createTime:2025-3-8 01:05:07
 * @updateTime：2025-3-8 01:05:12
 * @Author:zhao.jian
 */
@Entity("product_category")
export class ProductCategoryEntity  extends BusinessBaseEntity{
   
    @Column({type:'int', name: 'parent_id',default:0,comment:'父级id' })
    parent_id: number;

    @Column({type:'varchar', name: 'name',comment:'类目名称'})
    name: string;

    @Column({type:'int', name: 'level',default:1, comment:'类目级别'})
    level: number;

    @Column({type:'int', name: 'status',default:0, comment:'类目状态'})
    status: number;

    @Column({type:'int', name: 'sort',comment:'排序'})
    sort: number;

    @Column({type:'varchar', name: 'description',comment:'分类描述'})
    description: String;

      // 即使不存于数据库，也需声明虚拟字段
    @Expose({ name: 'label' }) // 若使用 class-transformer
    get label(): string {
        return this.name;
    }
}
