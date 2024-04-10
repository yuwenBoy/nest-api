import {applyDecorators, SetMetadata } from "@nestjs/common";
import { API_AUTH_KEY } from '../constants/api.auth';
/**
 * @Author:zhao.jian
 * @Date:2023-4-4 16:21:02
 * @Description:自定义API 守卫装饰器 全局验证资源是否可访问
 * @returns {*}
 */
 export function ApiAuth() {
    return applyDecorators(SetMetadata(API_AUTH_KEY,true));
 }