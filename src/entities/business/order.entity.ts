import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
  BaseEntity,
} from 'typeorm';
import { BusinessBaseEntity } from '../common/base.entity';

// 订单状态枚举（便于代码提示）
export enum OrderStatus {
  UNPAID = 0, // 待支付
  PENDING = 1, // 待接单
  DELIVERING = 2, // 配送中
  COMPLETED = 3, // 已完成
  CANCELLED = 4, // 已取消
}

// 支付状态枚举
export enum PayStatus {
  UNPAID = 0, // 未支付
  PAID = 1, // 已支付
}

// 支付方式枚举
export enum PayMethod {
  WECHAT = 'wechat',
  ALIPAY = 'alipay',
}

@Entity('order') // 对应数据库表名
@Unique(['orderNo']) // 对应 uk_order_no 唯一索引
export class OrderEntity extends BusinessBaseEntity {

  // 订单编号（唯一索引）
  @Column({
    name: 'order_no',
    type: 'varchar',
    length: 32,
    comment: '订单编号',
  })
  orderNo: string;

  // 用户ID（普通索引）
  @Index('idx_user_id') // 对应 idx_user_id 索引
  @Column({
    name: 'user_id',
    type: 'bigint',
    unsigned: true,
    comment: '用户ID',
  })
  userId: number;

  // 门店ID（普通索引）
  @Index('idx_store_id') // 对应 idx_store_id 索引
  @Column({
    name: 'store_id',
    type: 'int',
    unsigned: true,
    comment: '门店ID',
  })
  storeId: number;

  // 门店名称（冗余）
  @Column({
    name: 'store_name',
    type: 'varchar',
    length: 100,
    comment: '门店名称',
  })
  storeName: string;

  // 地址ID
  @Column({
    name: 'address_id',
    type: 'bigint',
    unsigned: true,
    comment: '收货地址ID',
  })
  addressId: number;

  // 收货人姓名（冗余）
  @Column({
    name: 'address_name',
    type: 'varchar',
    length: 20,
    comment: '收货人姓名',
  })
  addressName: string;

  // 收货电话（冗余）
  @Column({
    name: 'address_phone',
    type: 'varchar',
    length: 20,
    comment: '收货电话',
  })
  addressPhone: string;

  // 收货详细地址（冗余）
  @Column({
    name: 'address_detail',
    type: 'varchar',
    length: 255,
    comment: '收货详细地址',
  })
  addressDetail: string;

  // 期望送达时间
  @Column({
    name: 'delivery_time',
    type: 'varchar',
    length: 50,
    default: '',
    comment: '期望送达时间',
  })
  deliveryTime: string;

  // 商品总价
  @Column({
    name: 'goods_total',
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '商品总价',
  })
  goodsTotal: number;

  // 配送费
  @Column({
    name: 'delivery_fee',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0.0,
    comment: '配送费',
  })
  deliveryFee: number;

  // 店铺优惠
  @Column({
    name: 'discount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0.0,
    comment: '店铺优惠金额',
  })
  discount: number;

  // 优惠券优惠
  @Column({
    name: 'coupon_discount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0.0,
    comment: '优惠券/红包优惠',
  })
  couponDiscount: number;

  // 最终支付金额
  @Column({
    name: 'final_total',
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '最终支付金额',
  })
  finalTotal: number;

  // 订单备注
  @Column({
    type: 'varchar',
    length: 500,
    default: '',
    comment: '订单备注',
  })
  remark: string;

  // 支付方式
  @Column({
    name: 'pay_method',
    type: 'varchar',
    length: 20,
    default: PayMethod.WECHAT,
    comment: '支付方式',
  })
  payMethod: string;

  // 支付状态（普通索引）
  @Index('idx_order_status') // 对应 idx_order_status 索引
  @Column({
    name: 'pay_status',
    type: 'tinyint',
    default: PayStatus.UNPAID,
    comment: '支付状态',
  })
  payStatus: PayStatus;

  // 订单状态
  @Column({
    name: 'order_status',
    type: 'tinyint',
    default: OrderStatus.UNPAID,
    comment: '订单状态',
  })
  orderStatus: OrderStatus;

  // 支付时间
  @Column({
    name: 'pay_time',
    type: 'datetime',
    nullable: true,
    comment: '支付时间',
  })
  payTime: Date;
}