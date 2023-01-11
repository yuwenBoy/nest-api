import { Column, Entity, PrimaryGeneratedColumn, BaseEntity, BeforeInsert } from 'typeorm';
import { ZJBaseEntity } from './base.entity';

/**
 * description:角色模块表
 * @createTime:2023-1-11 17:53:49
 * @Author:zhao.jian
 */
@Entity("t_role_module")
export class RoleModule extends ZJBaseEntity { 
}
