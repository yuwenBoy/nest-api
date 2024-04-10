import { Module } from "@nestjs/common";
import { SystemModule } from "./system/system.module";
import { GoodsModule } from "./goods/goods.module";
import { OrderModule } from "./order/order.module";
@Module({
    imports:[
        SystemModule,
        GoodsModule,
        OrderModule,
    ] //  // jwt登录模块必须单独引用，不然出现ERROR [ExceptionsHandler] Unknown authentication strategy "local" Error: Unknown authentication stra
})
export class AdminModule{}