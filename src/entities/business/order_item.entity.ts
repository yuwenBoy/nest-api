import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
  BaseEntity,
} from 'typeorm';
import { BusinessBaseEntity } from '../common/base.entity';

@Entity('order_item') // 对应数据库表名
export class OrderItemEntity extends BusinessBaseEntity {
  // 主键ID
  @PrimaryGeneratedColumn({ 
    type: 'bigint',
    unsigned: true,
    comment: '订单项主键ID',
  })  
  id: number;

  // 关联订单ID（索引）
  @Index('idx_order_id') // 对应 idx_order_id 索引
  @Column({
    name: 'order_id',
    type: 'bigint',
    unsigned: true,
    comment: '关联订单主键ID',
  })
  orderId: number;

  // 订单编号（冗余，索引）
  @Index('idx_order_no') // 对应 idx_order_no 索引
  @Column({
    name: 'order_no',
    type: 'varchar',
    length: 32,
    comment: '订单编号',
  })
  orderNo: string;

  // 商品ID（索引）
  @Index('idx_product_id') // 对应 idx_product_id 索引
  @Column({
    name: 'product_id',
    type: 'int',
    unsigned: true,
    comment: '商品ID',
  })
  productId: number;

  // 商品名称（快照）
  @Column({
    name: 'product_name',
    type: 'varchar',
    length: 100,
    comment: '商品名称',
  })
  productName: string;

  // 规格名称（快照）
  @Column({
    name: 'spec_name',
    type: 'varchar',
    length: 50,
    default: '',
    comment: '商品规格名称',
  })
  specName: string;

  // 商品单价（快照）
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '商品单价',
  })
  price: number;

  // 购买数量
  @Column({
    type: 'int',
    comment: '购买数量',
  })
  count: number;
}