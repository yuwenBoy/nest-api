import { Entity } from "typeorm";

@Entity()
export class menuMeta {
    title:string;
    icon:string;
    noCache:Boolean;
}

@Entity()
export class menuList {
    name:string;
    path:string;
    hidden:Boolean;
    component:string;
    meta:menuMeta
}

@Entity()
export class menuDto {
    
    name: string;

    path:string;

    hidden:Boolean;

    redirect:string;

    component:string;
    alwaysShow:boolean;
    meta: menuMeta;

    children:menuList
}