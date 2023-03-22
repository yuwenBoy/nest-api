import { Module } from "@nestjs/common";
// import { AuthModule } from "./system/auth/auth.module";
import { SystemModule } from "./system/system.module";

@Module({
    imports:[SystemModule,
        // AuthModule
    ] //  // jwt登录模块必须单独引用，不然出现ERROR [ExceptionsHandler] Unknown authentication strategy "local" Error: Unknown authentication stra
})
export class AdminModule{}