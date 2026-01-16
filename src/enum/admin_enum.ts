
/**
 * 用户状态 1 启用 2 禁用
 */
export enum UserStatusEnum {
    DISABLED = 1, // 启用
    UNDISABLED = 2 // 禁用
 }

 /**
 * 菜单是否可见状态 0 可见 1 不可见
 */
export enum MenuHiddenEnum {
    SEE = 0, // 可见
    UNSEE = 1 // 不可见
 }

 /**
 * 用户类型 1 系统用户 2 商家用户 3门店用户
 */
export enum UserTypeEnum {
    SYSTEMUSER = 1, // 系统用户
    BUSINESSUSER = 2, // 商家用户
    STOREUSER = 3 // 门店用户
}

 
 /**
 * 角色类型 0系统用户 1商家角色 2员工角色
 */
export enum RoleTypeEnum {
    SYSTEMROLE = 0, // 系统角色
    BUSINESSROLE = 1, // 商家角色
    EMPLOYESSROLE = 2 // 员工角色
 }


 /**
  * 资源是否可授权给员工 默认不可授权
  */
 export enum ModuleIsAuthorizedEnum {
    YES = 1, // 可授权
    NO = 0, // 不可授权
 }

  /**
  * 该资源是否继承父级的资源状态，默认继承，设置1不继承
  */
  export enum ModuleInheritAuthorizationEnum {
    YES = 0,  // 可继承
    NO = 1,// 不可继承
 }


/**
 * 动态属性类型 1 文本 2 级联 3 下拉 4 多选
 */
export enum attributeTypeEnum {
    TEXT = 1, // 文本
    CASCADER = 2, // 级联
    SELECT = 3, // 下拉
    BATCHSELECT = 4 // 多选
}





  