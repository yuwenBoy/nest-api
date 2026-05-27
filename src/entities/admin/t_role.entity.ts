import { Column, Entity, PrimaryGeneratedColumn, BaseEntity, BeforeInsert } from 'typeorm';
import { ZJBaseEntity } from '../common/base.entity';
import { RoleTypeEnum } from '../../enum/admin_enum';

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

    @Column({type:'enum',default:RoleTypeEnum.SYSTEMROLE,enum:RoleTypeEnum, name: 'role_type',comment:'角色类型'})
    roleType: RoleTypeEnum;

    @Column({type:'varchar',comment:'备注'})
    remark: string;
}
