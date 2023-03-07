import { Column, Entity, PrimaryGeneratedColumn, BaseEntity, BeforeInsert } from 'typeorm';
import { ZJBaseEntity } from './base.entity';

/**
 * description:菜单表
 * @createTime:2023-1-11 17:40:49
 * @Author:zhao.jian
 */
@Entity("t_module")
export class ModuleNEST extends ZJBaseEntity { 
    @Column({type:'varchar', name: 'name'})
    name: string;

    @Column({type:'varchar', name: 'code'})
    code: string;

    @Column({type:'int', name: 'parent_id'})
    parentId: Number;

    @Column({type:'varchar', name: 'system_code'})
    systemCode: string;

    @Column({type:'varchar', name: 'menu_path'})
    menuPath: string;

    @Column({type:'varchar', name: 'index_no'})
    indexNo: string;

    @Column({type:'int', name: 'menu_type'})
    menuType: Number;

    @Column({type:'varchar', name: 'icon'})
    icon: string;

    @Column({type:'varchar', name: 'permission'})
    permission: string;
}
