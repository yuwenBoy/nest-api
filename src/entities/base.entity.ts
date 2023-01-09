import { BaseEntity, Column, PrimaryGeneratedColumn } from 'typeorm';

/**
 * @description：系统中的基类
 * @author:zhao.jian
 * @create_time：2023-1-9 11:59:11
 */
export abstract class ZJBaseEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  create_time: Date;

  @Column({ type: 'varchar', name: 'update_by' })
  update_by: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  update_time: Date;

  @Column({ type: 'varchar', name: 'create_by' })
  create_by: string;
}
