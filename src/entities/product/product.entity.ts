import { Transform, TransformFnParams } from 'class-transformer';
import { Column, Entity, PrimaryGeneratedColumn, BaseEntity, BeforeInsert, OneToOne } from 'typeorm';
import { BusinessBaseEntity } from '../common/base.entity';
import { ProductAuditStatusEnum, ProductSaleStatusEnum } from '../../enum/business_enum';

/**
 * description:产品表
 * @createTime:2025-3-7 10:24:58
 * @Author:zhao.jian
 */
@Entity("product")
export class ProductEntity extends BusinessBaseEntity { 
    @Column({type:'varchar', name: 'product_name'})
    productName: string;

    @Column({type:'int', name: 'store_id',comment:'门店ID'})
    storeId: number;

    @Column({type:'varchar', name: 'description',comment:'产品描述'})
    description: string;

    @Column({type:'varchar', name: 'image_url',comment:'产品图片'})
    imageUrl?: string;

    @Column({type:'enum',default:ProductAuditStatusEnum.APPLYIN,enum:ProductAuditStatusEnum, name: 'status',comment:'审核状态'})
    status: ProductAuditStatusEnum;

    @Column({type:'enum',default:ProductSaleStatusEnum.DOWNSALE,enum:ProductSaleStatusEnum, name: 'is_active',comment:'产品状态'})
    isActive: number;

    @Column({type:'int', name: 'category_id',comment:'商品所属的最末级分类ID'})
    categoryId:number;
}
