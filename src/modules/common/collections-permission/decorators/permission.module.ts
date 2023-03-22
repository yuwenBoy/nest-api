import { applyDecorators, SetMetadata } from "@nestjs/common"

/***
 * @Author: zhao.jian
 * @Date: 2023-3-22 11:14:53
 * @LastEditors: zhao.jian
 * @Description：使用在类上的装饰器
 * @param { string } name
 * @return {*}
 */
export const PermissionModule = (name:string):MethodDecorator & ClassDecorator => {
    return applyDecorators(SetMetadata(PermissionModule,name))
}