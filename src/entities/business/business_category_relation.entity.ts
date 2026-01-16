import { Expose, Transform, TransformFnParams } from 'class-transformer';
import { formatTime } from 'src/utils/date';
import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BusinessEntity } from './business.entity';
import { BusinessCategoryEntity } from './category.entity';
/**
 * description:商家审核表
 * @createTime:2025-2-21 14:56:17  
 * @Author:zhao.jian
 */
@Entity("businesscategoryrelation")
export class BusinessCategoryRelationEntity{ 

    @PrimaryGeneratedColumn({comment:'主键ID'})
    id: number;

      // 自动管理创建时间
      @CreateDateColumn({name: 'created_at',comment:'创建时间'})
      @Transform((row: TransformFnParams) => {
         let timestamp: any = new Date(row.value);
         return formatTime(timestamp / 1000);
       })
     createdAt: Date;

    @Column({type:'int', name: 'business_id',comment:'商家ID'})
    businessId: number;

    @Column({type:'int', name: 'category_id',comment:'分类ID'})
    categoryId: number;     

    @ManyToOne(() => BusinessEntity, (merchant) => merchant.id)
    @JoinColumn({ name: 'business_id' }) // 明确指定外键字段名
    merchant: BusinessEntity;
  
    @ManyToOne(() => BusinessCategoryEntity, (category) => category.id)
    @JoinColumn({ name: 'category_id' }) // 明确指定外键字段名
    category: BusinessCategoryEntity;
}  
