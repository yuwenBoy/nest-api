import {
  BaseEntity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Transform, TransformFnParams } from 'class-transformer';
import { formatTime } from 'src/utils/date';

/**
 * @description：系统基类
 * @author:zhao.jian
 * @create_time：2023-1-9 11:59:11
 */
export abstract class ZJBaseEntity extends BaseEntity {

  @PrimaryGeneratedColumn({comment:'主键ID'})
  id: number;

  @Column({comment:'更新人', type: 'varchar', name: 'update_by', select: false })
  update_by: string;

  @CreateDateColumn({comment:'创建时间',nullable:true,update:true})
  @Transform((row: TransformFnParams) => {
    let timestamp: any = new Date(row.value);
    return formatTime(timestamp / 1000);
  })
  create_time: Date;

  @Transform((row: TransformFnParams) => {
    let timestamp: any = new Date(row.value);
    return formatTime(timestamp / 1000);
  })
  @UpdateDateColumn({comment:'更新时间'})
  update_time: Date;

  @Column({comment:'创建人', type: 'varchar', name: 'create_by', select: false,update:false })
  create_by: string;
}
