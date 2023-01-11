import { Column, Entity, PrimaryGeneratedColumn, BaseEntity, BeforeInsert } from 'typeorm';
import { ZJBaseEntity } from './base.entity';

/**
 * description:用户角色表
 * @createTime:2023-1-11 17:51:57
 * @Author:zhao.jian
 */
@Entity("t_user_role")
export class UserRole extends ZJBaseEntity { 
}
