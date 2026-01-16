import { Column, Entity, PrimaryGeneratedColumn, BaseEntity, BeforeInsert } from 'typeorm';
import { ZJBaseEntity } from '../common/base.entity';
import { MenuHiddenEnum, ModuleInheritAuthorizationEnum, ModuleIsAuthorizedEnum } from 'src/enum/admin_enum';

/**
 * description:菜单表
 * @createTime:2023-1-11 17:40:49
 * @Author:zhao.jian
 */
@Entity("t_module")
export class ModuleEntity extends ZJBaseEntity { 
    @Column({type:'varchar', name: 'name'})
    name: string;

    @Column({type:'varchar', name: 'code'})
    code: string;

    @Column({type:'int', name: 'parent_id'})
    parent_id: number;

    @Column({type:'varchar', name: 'system_code'})
    systemCode: string;

    @Column({type:'varchar', name: 'menu_path'})
    menuPath: string;

    @Column({type:'varchar', name: 'index_no'})
    indexNo: string;

    @Column({type:'int', name: 'menu_type'})
    menuType: number;

    @Column({type:'varchar', name: 'icon'})
    icon: string;

    @Column({type:'varchar', name: 'permission'})
    permission: string;

    @Column({type:'enum',default:ModuleIsAuthorizedEnum.NO,enum:ModuleIsAuthorizedEnum, name: 'is_authorized',comment:'资源是否可授权给员工，默认不可授权给员工'})
    isAuthorized:ModuleIsAuthorizedEnum;

    @Column({type:'enum',default:ModuleInheritAuthorizationEnum.YES,enum:ModuleInheritAuthorizationEnum, name: 'inherit_authorization',comment:'该资源是否继承父级的资源状态，默认继承，设置1不继承'})
    inheritAuthorization:ModuleInheritAuthorizationEnum;

    /***
     * 是否可见
     */
    @Column({type:'enum',default:MenuHiddenEnum.SEE,enum:MenuHiddenEnum, name: 'hidden',comment:'菜单是否可见'})
    hidden:Number;
}
