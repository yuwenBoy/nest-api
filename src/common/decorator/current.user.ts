import { createParamDecorator, ExecutionContext } from "@nestjs/common";

/**Author：zhaojian
 * CreateTime:2023年3月21日14:17:09
 * desc：获取当前用户信息
 */
export const CurrentUser = createParamDecorator((data:string,ctx:ExecutionContext) => {
    const request =  ctx.switchToHttp().getRequest();
    if(data && request.user) {
        return request.user[data];
    }else{
        return request.user;
    }
})