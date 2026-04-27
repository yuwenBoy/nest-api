import {
  Entity,
  Column,
  Index,
  Unique,
} from 'typeorm';
import { BusinessBaseEntity } from '../common/base.entity';

// 订单状态枚举（便于代码提示）
export enum OrderStatus {
  UNPAID = 0, // 待支付
  PENDING_ACCEPT = 1, // 待接单
  ACCEPTED_PREPARE = 2, // 待出餐（已接单/备货中）
  DAIPEISONG = 3, // 待配送
  PEISONGZHONG = 4, // 配送中
  YIWANCHENG = 5, // 已完成
  CANCELED_MANUAL = 6, // 人工取消
  CANCELED_TIMEOUT = 7, // 超时关闭
  REFUND_ALL_PART = 8, // 全额/部分退款

  // 0 待支付（用户没付钱，超时自动关单）
  // 1 待接单（已付款，等商家接单）
  // 2 已接单/备货中（商家确认接单、打包、拣货）
  // 3 配送中（骑手取货/发货）
  // 4 已完成（正常履约结束）
  // 5 已取消（用户主动取消/商家拒单）👉 区分主动
  // 6 已超时关闭（未支付超时/接单超时系统关单）
  // 7 已退款/部分退款（售后、原路退）👉 
}

// 状态转中文文案
export const OrderStatusText: Record<OrderStatus, string> = {
  [OrderStatus.UNPAID]: '待支付',
  [OrderStatus.PENDING_ACCEPT]: '待接单',
  [OrderStatus.ACCEPTED_PREPARE]: '备货中',
  [OrderStatus.DAIPEISONG]: '待配送',
  [OrderStatus.PEISONGZHONG]: '配送中',
  [OrderStatus.YIWANCHENG]: '已完成',
  [OrderStatus.CANCELED_MANUAL]: '已取消',
  [OrderStatus.CANCELED_TIMEOUT]: '超时关闭',
  [OrderStatus.REFUND_ALL_PART]: '已退款',
};

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

  // 取消原因
  @Column({
    name: 'cancel_reason',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: '取消原因',
  })
  cancelReason: string;

  // 取消时间
  @Column({
    name: 'cancel_time',
    type: 'datetime',
    nullable: true,
    comment: '取消时间',
  })
  cancelTime: Date;

  // 配送开始时间
  @Column({
    name: 'delivery_start_time',
    type: 'datetime',
    nullable: true,
    comment: '配送开始时间',
  })
  deliveryStartTime: Date;

  // 配送结束时间
  @Column({
    name: 'delivery_end_time',
    type: 'datetime',
    nullable: true,
    comment: '配送结束时间',
  })
  deliveryEndTime: Date;

  // 骑手ID
  @Column({
    name: 'rider_id',
    type: 'bigint',
    unsigned: true,
    nullable: true,
    comment: '骑手ID',
  })
  riderId: number;

  // 骑手姓名
  @Column({
    name: 'rider_name',
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '骑手姓名',
  })
  riderName: string;

  // 骑手电话
  @Column({
    name: 'rider_phone',
    type: 'varchar',
    length: 20,
    nullable: true,
    comment: '骑手电话',
  })
  riderPhone: string;

  // 商家接单时间
  @Column({
    name: 'accept_time',
    type: 'datetime',
    nullable: true,
    comment: '商家接单时间',
  })
  acceptTime: Date;

  // 备货完成时间
  @Column({
    name: 'prepare_time',
    type: 'datetime',
    nullable: true,
    comment: '备货完成时间',
  })
  prepareTime: Date;
}
