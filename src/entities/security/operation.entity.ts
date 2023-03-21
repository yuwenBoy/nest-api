import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
@Entity('t_operationLog')
export class OperationLog  extends BaseEntity{
  @PrimaryGeneratedColumn()
  id: number;
  @Column('varchar', { comment: '操做人' })
  operator: string;
  @Column('varchar', { comment: '调用的方法' })
  method: string;
  @Column('varchar', { comment: '操做名称' })
  operation: string;
  @Column('varchar', { comment: '数据库表名' })
  entity: string;
  //   @Column('varchar')
  //   entityId: string;
  @Column('json')
  oldEntity: Record<string, any>;
  @Column('json')
  newEntity: Record<string, any>;
}
