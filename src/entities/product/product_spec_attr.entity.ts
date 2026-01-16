import { Column, Entity } from 'typeorm';
import { BusinessBaseEntity } from '../common/base.entity';
import { Expose } from 'class-transformer';

/**
 * description:产品规格属性表
 * @createTime:2025-3-28 15:13:09
 * @Author:zhao.jian
 */
@Entity("product_spec_attr")
export class ProductSpecAttrEntity extends BusinessBaseEntity { 
    @Column({type:'varchar', name: 'name',comment:'属性名称'})
    name: string;

    @Column({type:'int', name: 'business_id',comment:'商家ID'})
    businessId: number;
    
    @Column({type:'int', name: 'sort',comment:'排序'})
    sort: number;

    // 即使不存于数据库，也需声明虚拟字段
    @Expose({ name: 'value' }) // 若使用 class-transformer
    get label(): string {
             return this.name;
    }
}
