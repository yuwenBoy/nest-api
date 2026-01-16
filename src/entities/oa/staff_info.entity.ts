import { Column, Entity, PrimaryGeneratedColumn, BaseEntity, BeforeInsert, OneToOne } from 'typeorm';
import { ZJBaseEntity } from '../common/base.entity';

/**
 * description:员工信息表
 * @createTime:2024-4-10 16:49:10
 * @Author:zhao.jian
 */
@Entity("staff_info")
export class StaffInfoEntity extends ZJBaseEntity { 
    @Column({type:'varchar', name: 'staff_name',comment:'员工姓名'})
    staff_name: Number;

    @Column({type:'date', name: 'staff_birthday',comment:'员工生日'})
    staff_birthday: Date;

    @Column({type:'varchar', name: 'staff_nick_name',comment:'员工昵称'})
    staff_nick_name: String;

    @Column({type:'int', name: 'staff_sex',comment:'员工性别'})
    staff_sex: String;

    @Column({type:'varchar', name: 'staff_id',comment:'员工身份证号'})
    staff_id: String;

    @Column({type:'varchar', name: 'staff_contact_way',comment:'员工联系方式'})
    staff_contact_way: String;

    @Column({type:'varchar', name: 'staff_home_address',comment:'家庭住址'})
    staff_home_address: String;

    @Column({type:'varchar', name: 'education',comment:'学历'})
    education: String;

    @Column({type:'varchar', name: 'speciality',comment:'专业'})
    speciality: String;

    @Column({type:'varchar', name: 'graduate_school',comment:'毕业院校'})
    graduate_school: String;

    @Column({type:'int', name: 'contact_type',comment:'合同类型'})
    contact_type: String;

    @Column({type:'varchar', name: 'emergency_contact',comment:'紧急联系人'})
    emergency_contact: String;

    @Column({type:'varchar', name: 'emergency_tel',comment:'紧急联系人电话'})
    emergency_tel: String;

    @Column({type:'int', name: 'master_worker',comment:'师傅'})
    master_worker: Number;

    @Column({type:'varchar', name: 'remarks',comment:'备注'})
    remarks: String;

    @Column({type:'int', name: 'user_id',comment:'关联用户id'})
    user_id: Number;
}
