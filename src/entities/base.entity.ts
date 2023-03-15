import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Timestamp,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  AfterLoad,
} from 'typeorm';

import { Request } from '@nestjs/common';

/**
 * @description：系统基类
 * @author:zhao.jian
 * @create_time：2023-1-9 11:59:11
 */
export abstract class ZJBaseEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', name: 'update_by' })
  update_by: string;

  @CreateDateColumn()
  create_time: Timestamp;

  @UpdateDateColumn()
  update_time: Timestamp;

  @Column({ type: 'varchar', name: 'create_by' })
  create_by: string;
}
