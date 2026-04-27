import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BusinessBaseEntity } from "../common/base.entity";
import { StoreEntity } from "./store.entity";
import { UserEntity } from "../admin/t_user.entity";

@Entity('employee')
export class EmployeeEntity extends BusinessBaseEntity {
 
  @Column({type:'int', name: 'user_id',comment:'用户ID'})
  user_id:number;

  @Column({type:'int', name: 'store_id',comment:'门店ID'})
  store_id:number;

  @ManyToOne(() => StoreEntity, store => store.employees)
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity;

  @ManyToOne(() => UserEntity, user => user.employees)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity; // 关联用户表

  @Column({type:'int', default: 1})
  status:number;


}