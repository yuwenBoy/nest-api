import { Column, Entity, PrimaryGeneratedColumn, BaseEntity, BeforeInsert } from 'typeorm';
import { ZJBaseEntity } from './base.entity';

/**
 * description:角色表
 * @createTime:2023-1-11 17:51:05
 * @Author:zhao.jian
 */
@Entity("t_role")
export class Role extends ZJBaseEntity { 
}
