import { Column, Entity, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

@Entity()
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({type:'varchar', name: 'username'})
  username: string;

  @Column({type:'varchar', name: 'password'})
  password: string;

  @Column({type:'varchar', name: 'cname',length:10})
  cname: string;

  @Column({type:'varchar', name: 'email'})
  email: string;

  @Column({type:'varchar', name: 'address'})
  address: string;

  @Column({type: 'timestamp', default: () => "CURRENT_TIMESTAMP"})
  create_time: Date;

  @Column({type:'varchar', name: 'update_by'})
  update_by: string;

  @Column({type:'varchar', name: 'avatar'})
  avatar: string;

  @Column({type:'int', name: 'isdisabled'})
  isdisabled: Number;

  @Column({type: 'timestamp', default: () => "CURRENT_TIMESTAMP"})
  update_time: Date;

  @Column({type:'varchar', name: 'phone'})
  phone: string;

  @Column({type:'varchar', name: 'create_by'})
  create_by: string;

  @Column({type:'int', name: 'dept_id'})
  dept_id: Number;

  @Column({type:'int', name: 'position_id'})
  position_id: Number;

  @Column({type:'int', name: 'sex'})
  sex: Number;

  @Column({type:'varchar', name: 'birthday'})
  birthday: string;
}
