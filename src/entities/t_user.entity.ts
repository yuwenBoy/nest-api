import { Column, Entity, BeforeInsert, JoinColumn, OneToOne } from 'typeorm';
import { bcrypt } from 'bcryptjs';
import { ZJBaseEntity } from './base.entity';
import { DeptEntity } from './dept.entity';
import { PositionEntity } from './position.entity';

/**
 * description:用户实体表
 * @createTime:2023-1-9 11:57:45
 * @Author:zhao.jian
 */
@Entity("t_user")
export class UserEntity extends ZJBaseEntity {
  @Column({type:'varchar', name: 'username'})
  username: string;

  // @Exclude({toPlainOnly:true})
  @Column({type:'varchar', name: 'password'})
  password: string;

  @Column({type:'varchar', name: 'cname',length:10})
  cname: string;

  @Column({type:'varchar', name: 'email'})
  email: string;

  @Column({type:'varchar', name: 'address'})
  address: string;

  @Column({type:'varchar', name: 'avatar'})
  avatar: string;

  @Column({type:'int', name: 'isdisabled'})
  isdisabled: Number;

  @Column({type:'varchar', name: 'phone'})
  phone: string;

  @Column({type:'int', name: 'dept_id'})
  dept_id: Number;

  @Column({type:'int', name: 'position_id'})
  position_id: Number;

  @Column({type:'int', name: 'sex'})
  sex: Number;

  @Column({type:'varchar', name: 'birthday'})
  birthday: string;

  // 用户关联机构
  @OneToOne(type => DeptEntity,dept =>dept.id)
  deptName: DeptEntity[];

  // 用户关联职位
  @OneToOne(type => PositionEntity,posi => posi.id)
  positionName:PositionEntity[];
  
  @BeforeInsert()
  async encryptPwd() {
    this.password = await bcrypt.hashSync(this.password);
  }
}
