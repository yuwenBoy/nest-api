import { Column, Entity, PrimaryGeneratedColumn, BaseEntity, BeforeInsert, OneToOne } from 'typeorm';
import { ZJBaseEntity } from './base.entity';
import { UserEntity } from './t_user.entity';

/**
 * description:机构表
 * @createTime:2023年3月8日13:34:33
 * @Author:zhao.jian
 */
@Entity("t_department")
export class DeptEntity extends ZJBaseEntity { 
    @Column({type:'int', name: 'department_type',comment:'组织类型 1 公司 2部门'})
    department_type: Number;

    @Column({type:'int', name: 'parent_id',comment:'父级id'})
    parent_id: Number;

    @Column({type:'varchar', name: 'department_name',comment:'组织名称'})
    department_name: String;

    @Column({type:'varchar', name: 'department_code',comment:'组织编码'})
    department_code: String;

    @OneToOne(type => UserEntity, user => user.dept_id)
    user: UserEntity;
}
