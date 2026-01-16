import { Column, Double, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BusinessBaseEntity } from "../common/base.entity";
import { EmployeeEntity } from "./employee.entity";
import { BusinessEntity } from "../business/business.entity";
import { StoreOnlineEnum, StoreStatusEnum } from "src/enum/business_enum";

@Entity('store')
export class StoreEntity extends BusinessBaseEntity {
 
 @Column({type:'varchar', name: 'store_name',comment:'门店名称'})
  storeName: string;

  @OneToMany(() => EmployeeEntity, employee => employee.store)
  employees: EmployeeEntity[];

    @Column({type:'int', name: 'business_id',comment:'商家ID'})
    business_id:number;

    @Column({type:'varchar', name: 'address',comment:'门店地址'})
    address: string;
        
    @Column({type:'int',default:StoreStatusEnum.APPLYIN,enum:StoreStatusEnum, name: 'status',comment:'状态'})
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
}