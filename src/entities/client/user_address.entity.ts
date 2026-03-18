import {
  Entity,
  Column,
  DeleteDateColumn,
} from 'typeorm';
import { ClientBaseEntity } from '../common/base.entity';

@Entity('user_address', { comment: '顾客收货地址表' })
export class UserAddressEntity extends ClientBaseEntity{

  @Column({ name:'profile_user_id', comment: '顾客ID' })
  profileUserId: number;

  @Column({ length: 50, comment: '收货人姓名' })
  receiver: string;

  @Column({ length: 20, comment: '手机号' })
  phone: string;

  @Column({ length: 50, comment: '省' })
  province: string;

  @Column({ length: 50, comment: '市' })
  city: string;

  @Column({ length: 50, comment: '区/县' })
  area: string;

  @Column({ name:'province_id' ,comment: '省' })
  provinceId: number;

  @Column({ name:'city_id', comment: '市' })
  cityId: number;

  @Column({ name: 'area_id', comment: '区/县' })
  areaId: number;

  @Column({ length: 255, comment: '详细地址',name:'detail_address' })
  detailAddress: string;

  @Column({ 
    type: 'int', 
    default: 0, 
    name:'is_default',
    comment: '是否默认地址 0-否 1-是' 
  })
  isDefault: number;

   @DeleteDateColumn({name:'deleted_at', comment: '删除时间', nullable: true })
  deletedAt: Date;  
}