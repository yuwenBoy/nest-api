import { Module } from "@nestjs/common";
import { SystemModule } from "./system/system.module";
/**
 * 整个系统模块----------
 * --------SystemModule-------权限管理模块
 */
@Module({
    imports:[SystemModule,
        // AuthModule
    ] //  // jwt登录模块必须单独引用，不然出现ERROR [ExceptionsHandler] Unknown authentication strategy "local" Error: Unknown authentication stra
})
export class AdminModule{}