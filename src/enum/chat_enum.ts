export enum MessageStatusEnum {
  SENT = 0, // 发送中（到服务器）
  DELIVERED = 1,// 已送达（到对方设备）
  READ = 2, // 已读
  FAILED = 3,// 发送失败
}

export enum TargetTypeEnum {
  STORE = 'STORE', // 平台-商家（门店）
  ORDER = 'ORDER',// 平台-用户（订单）
  CUSTOMER = 'CUSTOMER',// 平台-用户（顾客）
  SYSTEM = 'SYSTEM',// 平台-系统
}