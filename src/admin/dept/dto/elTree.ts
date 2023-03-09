import { Column, Entity } from "typeorm";

@Entity()
export class deptToTree {

    @Column({type:'varchar', name: 'sort',comment:'排序'})
    sort:string

    @Column({type:'bool', name: 'enabled',comment:'状态'})
    enabled: Boolean; 

    @Column({type:'int', name: 'id',comment:''})
    id: Number; 

    @Column({type:'int', name: 'pid',comment:''})
    pid: Number; 

    
    @Column({type:'varchar', name: 'label',comment:'节点名称'})
    label: string; 

    @Column({type:'varchar', name: 'name',comment:'节点名称'})
    name: string; 

    @Column({type:'bool', name: 'leaf',comment:'是否最後一級'})
    leaf: Boolean; 

    @Column({type:'bool', name: 'hasChildren',comment:'是否有子节点'})
    hasChildren: Boolean; 
}