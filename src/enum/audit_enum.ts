/**
 * 审核目标类型枚举
 */
export enum AuditTargetType {
  BUSINESS = 1,       // 商家审核
  STORE_MODIFY = 2,   // 门店信息修改
  STORE_AVATAR = 3,   // 门店头像修改
  PRODUCT = 4,        // 商品审核（预留）
  RIDER = 5,          // 骑手审核（预留）
}

/**
 * 审核状态枚举
 */
export enum AuditStatusEnum {
  PENDING = 0,        // 待审核
  APPROVED = 1,       // 审核通过
  REJECTED = 2,       // 审核驳回
}

/**
 * 审核目标类型描述
 */
export const AuditTargetTypeDesc: Record<AuditTargetType, string> = {
  [AuditTargetType.BUSINESS]: '商家',
  [AuditTargetType.STORE_MODIFY]: '门店信息修改',
  [AuditTargetType.STORE_AVATAR]: '门店头像修改',
  [AuditTargetType.PRODUCT]: '商品',
  [AuditTargetType.RIDER]: '骑手',
};

/**
 * 审核状态描述
 */
export const AuditStatusDesc: Record<AuditStatusEnum, string> = {
  [AuditStatusEnum.PENDING]: '待审核',
  [AuditStatusEnum.APPROVED]: '审核通过',
  [AuditStatusEnum.REJECTED]: '审核驳回',
};