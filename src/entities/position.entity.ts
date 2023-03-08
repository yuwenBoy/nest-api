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
    //==============================当前字段不知道代表什么？？？？？？？？？？
    // @Column({type:'int', name: 't_department_id',comment:'组织id'})
    // t_department_id: Number;

    @Column({type:'varchar', name: 'name',comment:'组织名称'})
    name: String;

    @Column({type:'varchar', name: 'code',comment:'组织编码'})
    code: String;
    
    @Column({type:'int', name: 'parent_id',comment:'父级id'})
    parent_id: Number;

    @OneToOne(type => UserEntity, user => user.position_id)
    user: UserEntity;
}
