export enum MessageStatusEnum {
  PENDING = 0,      // 发送中（到服务器）
  SENT = 1,         // 已发送（服务器确认）
  DELIVERED = 2,    // 已送达（到对方设备）
  READ = 3,         // 已读
  FAILED = 4,       // 发送失败
}