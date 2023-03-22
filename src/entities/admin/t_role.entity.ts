import { Column, Entity, PrimaryGeneratedColumn, BaseEntity, BeforeInsert } from 'typeorm';
import { ZJBaseEntity } from './base.entity';

/**
 * description:角色表
 * @createTime:2023-1-11 17:51:05
 * @Author:zhao.jian
 */
@Entity("t_role")
export class RoleEntity extends ZJBaseEntity { 
    @Column({type:'varchar',comment:'名称'})
    name: string;

    @Column({type:'varchar',comment:'编码'})
    code: string;

    @Column({type:'varchar',comment:'父级ID'})
    parent_id: string;

    @Column({type:'varchar',comment:'系统编码'})
    system_code: string;

    @Column({type:'varchar',comment:'备注'})
    remark: string;
}
