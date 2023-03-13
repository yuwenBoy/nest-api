import { Column, Entity, BeforeInsert, JoinColumn, OneToOne } from 'typeorm';
import { bcrypt } from 'bcryptjs';
import { ZJBaseEntity } from './base.entity';
import { DeptEntity } from './dept.entity';
import { PositionEntity } from './position.entity';
import { Disabled } from 'src/utils/enum/admin';

/**
 * description:用户实体表
 * @createTime:2023-1-9 11:57:45
 * @Author:zhao.jian
 */
@Entity("t_user")
export class UserEntity extends ZJBaseEntity {
  @Column({type:'varchar', name: 'username',comment:'账号'})
  username: string;

  @Column({type:'varchar', name: 'password'})
  password: string;

  @Column({type:'varchar', name: 'cname',length:10,comment:'姓名'})
  cname: string;

  @Column({type:'varchar', name: 'email'})
  email: string;

  @Column({type:'varchar', name: 'address'})
  address: string;

  @Column({type:'varchar', name: 'avatar'})
  avatar: string;

  @Column({type:'enum',default:"1",enum:Disabled, name: 'disabled',comment:'状态'})
  disabled: Disabled;

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

  @Column({type:'varchar', name: 'nick_name',comment:'昵称'})
  nick_name: string;

  @Column({type:'int', name: 'master_work_id',comment:'主管Id'})
  master_work_id: Number;

  @Column({type:'varchar', name: 'master_work_name',comment:'主管名称'})
  master_work_name: string;

  @Column({type:'varchar', name: 'employee_no',comment:'员工编号'})
  employee_no: string;

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





// DROP TABLE `zj_db_system`.`t_user`
// GO
// CREATE TABLE `t_user` (
//   `id` bigint NOT NULL AUTO_INCREMENT,
//   `username` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL COMMENT '账号',
//   `password` varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT '123456' COMMENT '密码',
//   `cname` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT '' COMMENT '姓名',
//   `email` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT '' COMMENT '邮箱',
//   `address` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT '' COMMENT '地址',
//   `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
//   `update_by` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT '‘’' COMMENT '更新人',
//   `avatar` varchar(500) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT '' COMMENT '头像',
//   `phone` varchar(11) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT '' COMMENT '手机',
//   `create_by` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT '‘’' COMMENT '创建人',
//   `dept_id` bigint DEFAULT NULL COMMENT '机构',
//   `position_id` bigint DEFAULT NULL COMMENT '职位',
//   `sex` int DEFAULT '0' COMMENT '（1.男2.女）',
//   `birthday` varchar(254) DEFAULT NULL COMMENT '出生日期',
//   `nick_name` varchar(20) DEFAULT NULL COMMENT '昵称',
//   `master_work_id` int DEFAULT NULL COMMENT '主管id',
//   `master_work_name` varchar(254) DEFAULT NULL COMMENT '主管名称',
//   `employee_no` varchar(254) DEFAULT NULL COMMENT '员工编号',
//   `disabled` int DEFAULT '1' COMMENT '1.启用2.锁定',
//   `update_time` timestamp NULL DEFAULT NULL COMMENT '更新时间',
//   PRIMARY KEY (`id`)
// ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3