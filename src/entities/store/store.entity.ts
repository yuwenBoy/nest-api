import { Column, Double, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BusinessBaseEntity } from "../common/base.entity";
import { EmployeeEntity } from "./employee.entity";
import { BusinessEntity } from "../business/business.entity";
import { StoreOnlineEnum, StoreStatusEnum } from "src/enum/business_enum";

// 下线类型枚举
export enum OfflineType {
  ACTIVE = 0, // 商家主动下线
  MODIFY = 1, // 修改信息下线
  PLATFORM =2, // 平台强制下线
}

// 暂停原因枚举
export enum PauseReason {
  MERCHANT = 1, // 商家主动暂停
  PLATFORM = 2, // 平台暂停
}

@Entity('store')
export class StoreEntity extends BusinessBaseEntity {
    
    @Column({type:'varchar', name: 'store_name',comment:'门店名称'})
    storeName: string;  

    @Column({type:'varchar', name: 'door_photo',comment:'门脸图'})
    doorPhoto: string;  

    @Column({type:'varchar', name: 'env_photo',comment:'环境图'})
    envPhoto: string;  

    @OneToMany(() => EmployeeEntity, employee => employee.store)
    employees: EmployeeEntity[];

    @Column({type:'int', name: 'business_id',comment:'商家ID'})
    business_id:number;

    @Column({type:'varchar', name: 'district_code',comment:'区代码'})
    district_code: string;

    @Column({type:'varchar', name: 'detail_address',comment:'门店地址'})
    detail_address: string;
        
    @Column({type:'int',default:StoreStatusEnum.OFFLINE,enum:StoreStatusEnum, name: 'status',comment:'状态'})
    status: StoreStatusEnum;  

    @Column({type:'int',default:StoreOnlineEnum.DOWNLINE,enum:StoreOnlineEnum, name: 'online',comment:'门店上线状态'})
    online: StoreOnlineEnum;  

    @Column({type:'varchar', name: 'contact_info',comment:'门店联系方式'})
    contactInfo: string;     

    @Column({type:'varchar', name: 'latitude',comment:'经度'})
    latitude: string;    
    
    @Column({type:'varchar', name: 'longitude',comment:'纬度'})
    longitude: string;  
    
    @Column({type:'varchar', name: 'remark',comment:'门店简介'})
    remark: string;  

    @Column({type:'varchar', name: 'notice',comment:'门店公告'})
    notice: string;  

    @Column({type:'varchar',name:'avatar_img',comment:'门店头像'})
    avatarImg:string;
    
    @ManyToOne(() => BusinessEntity, business => business.audit, {
        eager: false,
        cascade: false,
      })
      @JoinColumn({ name: 'business_id' }) // 明确指定外键字段名
      business: BusinessEntity; 

   @Column({type:'int', name: 'is_default',comment:'是否默认门店'})
   isDefault:number;


  // 新增：下线类型
  @Column({ 
    name: 'offline_type', 
    type: 'varchar',
    length: 20,
    nullable: true,
    default: OfflineType.ACTIVE,
    comment: '下线类型'
  })
  offlineType: OfflineType;

  // 新增：暂停原因
  @Column({ 
    name: 'pause_reason', 
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '暂停原因'
  })
  pauseReason: PauseReason;

  syncOnlineStatus(): void {
    this.online = [StoreStatusEnum.ONLINE, StoreStatusEnum.PAUSE].includes(this.status) ? 1 : 0;
  }
}