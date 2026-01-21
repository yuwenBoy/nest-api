export enum MessageStatusEnum {
  SENT = 0, // 发送中（到服务器）
  DELIVERED = 1,// 已送达（到对方设备）
  READ = 2, // 已读
  FAILED = 3,// 发送失败
}