
/****
 * 商家状态
 */
export enum BusinessStatusEnum{
    ACTIVE = 1, // 活跃
    APPLYIN = 0, // 审核中
    END = 2, //停用
}

/**
 * 审核记录状态
 */
export enum AuditLogStatusEnum{
    PENDING = 0, // 待审核
    APPROVED = 1, // 审核通过
    REJECTED = 2, // 审核驳回
}



/****
 * 商家审核状态
 */
export enum BusinessAuditStatusEnum{
    SUCCESS = 1, // 审核通过
    APPLYIN = 0, // 审核中
    ERROR = 2, //审核拒绝
}

/****
 * 门店状态：offline-已下线，pending_audit-审核中，audit_approved-审核通过（待上线），online-营业中，pause-暂停营业，forbidden-永久封禁
 * 
 * offline / 0	已下线	初始默认状态	1. 新店创建未提交审核；2. 审核驳回后恢复；3. 商家主动下线；4. 平台驳回后
pending_audit / 1	审核中	提交修改 / 上线申请后	商家提交审核，平台未处理前
audit_approved / 2	审核通过（待上线）	平台审核通过，商家未手动上线	审核通过后，商家可自主选择 “立即上线” 或 “暂不上线”
online / 3	营业中	正常对外展示 / 接单	商家点击 “上线” 后（核心运营状态）
pause / 4	暂停营业	临时停止运营	1. 商家主动暂停（如装修）；2. 平台临时暂停（如违规警告）
forbidden / 5	永久封禁	平台强制下线且不可恢复	商家严重违规（如售假），平台永久封禁
 */
export enum StoreStatusEnum{
    // APPLYIN = 0, // 审核中
    // ACTIVE = 1, // 营业中
    // END = 2, //暂停营业
    // SYSTENEND = 3, // 被平台暂停
    OFFLINE = 0, // 已下线
    PENDING_AUDIT = 1, // 审核中
    AUDIT_APPROVED = 2, // 审核通过
    ONLINE = 3, // 营业中
    PAUSE = 4, // 暂停营业
    FORBIDDEN = 5, // 永久封禁
}

/****
 * 门店上线状态
 */
export enum StoreOnlineEnum{
    INLINE = 1, // 上线中
    DOWNLINE = 0, // 门店已下线
}



/****
 * 产品审核状态
 */
export enum ProductAuditStatusEnum{
    SUCCESS = 1, // 审核通过
    APPLYIN = 0, // 审核中
    ERROR = 2, //审核拒绝
}


/****
 * 产品售卖状态
 */
export enum ProductSaleStatusEnum{
    DOWNSALE = 2, // 下架
    UPSALE = 1, // 上架
}