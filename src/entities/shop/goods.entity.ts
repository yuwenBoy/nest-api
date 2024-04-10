import { Transform, TransformFnParams } from 'class-transformer';
import { Column, Entity, PrimaryGeneratedColumn, BaseEntity, BeforeInsert, OneToOne } from 'typeorm';
import { ZJBaseEntity } from '../common/base.entity';

/**
 * description:商品 spu表
 * @createTime:2023-5-31 16:33:26
 * @Author:zhao.jian
 */
@Entity("t_goods")
export class GoodsEntity extends ZJBaseEntity { 
    @Column({type:'varchar', name: 'goods_name'})
    goods_name: string;

    @Column({type:'int', name: 'category_level1_id',comment:'产品一级分类'})
    category_level1_id: Number;

    @Column({type:'int', name: 'category_level2_id',comment:'产品二级分类'})
    category_level2_id: Number;

    @Column({type:'int', name: 'category_level3_id',comment:'产品三级分类'})
    category_level3_id: Number;

    @Column({type:'int', name: 'brand_id',comment:'品牌id'})
    brand_id: Number;

    
    @Column({type:'varchar', name: 'brand_name',comment:'品牌名称'})
    brand_name: string;

    @Column({type:'varchar', name: 'goods_pic',comment:'商品图片'})
    goods_pic: string;

    @Column({type:'varchar', name: 'goods_desc',comment:'商品描述'})
    goods_desc: string;

    @Column({type:'char', name: 'on_sale',comment:'商品状态'})
    on_sale: Number;

    @Column({type:'varchar', name: 'goods_detail',comment:'商品详情'})
    goods_detail: string;
}
