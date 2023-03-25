import { Column, Entity, PrimaryGeneratedColumn, BaseEntity, BeforeInsert } from 'typeorm';
import { ZJBaseEntity } from '../common/base.entity';

/**
 * description:用户角色表
 * @createTime:2023-1-11 17:51:57
 * @Author:zhao.jian
 */
@Entity("t_user_role")
export class UserRoleEntity extends ZJBaseEntity { 
    @Column({type:'int', name: 'user_id'})
    userId: Number;

    @Column({type:'int', name: 'role_id'})
    roleId: Number;
}