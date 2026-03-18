import { Entity } from 'typeorm/decorator/entity/Entity';
import { BusinessBaseEntity } from '../common/base.entity';
import { Column } from 'typeorm';

/***
 * StoreQualification实体
 * 店铺资质
 * @author <NAME>zhaojian</NAME>
 * @Date 2026-3-10 14:41:05
 */
@Entity('store_qualification')
export class StoreQualificationEntity extends BusinessBaseEntity {
  @Column({ name: 'store_id', comment: '门店ID' })
  storeId: number;

  @Column({ name: 'license_type', nullable: true, comment: '许可证类型' })
  licenseType: string;

  @Column({ name: 'license_no', nullable: true, comment: '许可证编号' })
  licenseNo: string;

  @Column({ name: 'company_name', nullable: true, comment: '公司名称' })
  companyName: string;

  @Column({ name: 'legal_person', nullable: true, comment: '法人' })
  legalPerson: string;

  @Column({ name: 'license_pic', nullable: true, comment: '许可证图片' })
  licensePic: string;

  @Column({name:'license_plan',nullable:true,comment:'经营场所'})
  licensePlan:string;

  @Column({
    name: 'license_valid_date',
    nullable: true,
    comment: '许可证有效期',
  })
  licenseValidDate: Date;

  @Column({ name: 'is_long_term', default: 0, comment: '是否长期有效(0/1)' })
  isLongTerm: number;

  @Column({ name: 'permit_type', nullable: true, comment: '资质证类型' })
  permitType: string;

  @Column({ name: 'permit_no', nullable: true, comment: '资质证编号' })
  permitNo: string;

  @Column({ name: 'permit_pic', nullable: true, comment: '资质证图片' })
  permitPic: string;

  @Column({
    name: 'permit_valid_date',
    nullable: true,
    comment: '资质证有效期',
  })
  permitValidDate: Date;

  @Column({ name: 'permit_address', nullable: true, comment: '资质证地址' })
  permitAddress: string;

  @Column({ name: 'permit_mainBusiness', nullable: true, comment: '主营业务' })
  permitMainBusiness: string;

  @Column({ name: 'permit_scope', nullable: true, comment: '经营范围' })
  permitScope: string;

  @Column({
    name: 'permit_expireDate',
    nullable: true,
    comment: '资质证过期时间',
  })
  permitExpireDate: Date;

  @Column({ name: 'permit_legalPerson', nullable: true, comment: '资质证法人' })
  permitLegalPerson: string;

  @Column({ name: 'permit_name', nullable: true, comment: '资质证名称' })
  permitName: string;

  @Column({ name: 'is_rang_date', default: 0, comment: '是否有有效期(0/1)' })
  isRangDate: number;
}
