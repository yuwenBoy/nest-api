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

/**https://lequ7.com/guan-yu-nestjsnestjs-xue-xi-zong-jie-pian.html
 * @description：系统中的基类
 * @author:zhao.jian
 * @create_time：2023-1-9 11:59:11
 */
export abstract class ZJBaseEntity extends BaseEntity {
  @AfterLoad()
  load(@Request() req) {
    this.update_by = req.user.username;
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', name: 'update_by' })
  update_by: string;

  @CreateDateColumn({ name: 'create_time', nullable: true })
  create_time: Timestamp;

  // 必须这样设置才生效
  // `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  // `update_time` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,

  @UpdateDateColumn()
  update_time: Timestamp;

  @Column({ type: 'varchar', name: 'create_by' })
  create_by: string;
}
