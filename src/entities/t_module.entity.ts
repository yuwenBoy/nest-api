import { Column, Entity, PrimaryGeneratedColumn, BaseEntity, BeforeInsert } from 'typeorm';
import { ZJBaseEntity } from './base.entity';

/**
 * description:菜单表
 * @createTime:2023-1-11 17:40:49
 * @Author:zhao.jian
 */
@Entity("t_module")
export class Module extends ZJBaseEntity { 
}
