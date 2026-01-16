
/****
 * 商家状态
 */
export enum BusinessStatusEnum{
    ACTIVE = 1, // 活跃
    APPLYIN = 0, // 审核中
    END = 2, //停用
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
 * 门店状态
 */
export enum StoreStatusEnum{
    ACTIVE = 1, // 营业中
    APPLYIN = 0, // 审核中
    END = 2, //暂停营业
    SYSTENEND = 3, // 被平台暂停
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