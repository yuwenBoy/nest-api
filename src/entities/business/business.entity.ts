import { Column, Entity, OneToMany } from 'typeorm';
import { BusinessBaseEntity } from '../common/base.entity';
import { BusinessStatusEnum } from '../../enum/business_enum';
import { BusinessCategoryRelationEntity } from './business_category_relation.entity';

/**
 * description:商家表
 * @createTime:2025-2-21 14:56:17
 * @Author:zhao.jian
 */
@Entity("business")
export class BusinessEntity extends BusinessBaseEntity {

    @Column({type:'varchar', name: 'title'})
    title: string;

    @Column({type:'varchar', name: 'address',comment:'商家地址'})
    address: string;

    @Column({type:'varchar', name: 'contact_phone',comment:'商家联系电话'})
    contactPhone: string;

    @Column({type:'varchar', name: 'business_license',comment:'商家营业执照编号'})
    businessLicense: String;


    @Column({type:'varchar', name: 'contact_name',comment:'商家联系人'})
    contactName: string;

    @Column({type:'varchar', name: 'health_license',comment:'食品经营许可证编号'})
    healthLicense: String;

    @Column({type:'enum',default:BusinessStatusEnum.APPLYIN,enum:BusinessStatusEnum, name: 'status',comment:'状态：0审核中 1活跃 2停用 3审核拒绝'})
    status: BusinessStatusEnum;

    @Column({type:'varchar', name: 'logo_url',comment:'商家logo'})
    logoUrl: String;


    @Column({type:'varchar', name: 'cover_url',comment:'商家封面图片'})
    coverUrl: String;

    @Column({type:'varchar', name: 'email',comment:'商家邮箱'})
    email: string;

    @Column({type:'varchar', name: 'description',comment:'商家'})
    description: String;

    /**
     * @deprecated 此关联已废弃，请使用 AuditLogEntity 进行审核记录管理
     */
    // @OneToOne(() => BusinessAuditEntity, audit => audit.business, { eager: false, cascade: false })
    // audit: BusinessAuditEntity;

    @OneToMany(() => BusinessCategoryRelationEntity, (merchantCategory) => merchantCategory.businessId)
    categories: BusinessCategoryRelationEntity[];
}
