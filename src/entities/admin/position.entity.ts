import { Column, Entity, PrimaryGeneratedColumn, BaseEntity, BeforeInsert, OneToOne } from 'typeorm';
import { ZJBaseEntity } from './base.entity';
import { UserEntity } from './t_user.entity';

/**
 * description:机构表
 * @createTime:2023年3月8日13:34:33
 * @Author:zhao.jian
 */
@Entity("t_position")
export class PositionEntity extends ZJBaseEntity { 
    @Column({type:'int', name: 't_department_id',comment:'组织id'})
    deptId: Number;

    @Column({type:'int', name: 'sort',comment:'组织id'})
    sort: Number;

    @Column({type:'varchar', name: 'name',comment:'职位名称'})
    name: String;

    @Column({type:'varchar', name: 'code',comment:'职位编码'})
    code: String;
    
    @Column({type:'int', name: 'parent_id',comment:'父级id'})
    parent_id: Number;

    @OneToOne(type => UserEntity, user => user.position_id)
    user: UserEntity;
}
