import { Module } from "@nestjs/common";
import { SystemModule } from "./system/system.module";
import { ProductModule } from "./product/product.module";
import { OrderModule } from "./order/order.module";
import { BusinessModule } from "./business/business.module";
@Module({
    imports:[
        SystemModule, // 权限系统模块
        ProductModule, // 产品管理模块
        OrderModule, // 订单管理模块
        BusinessModule, // 商家管理模块
    ] //  // jwt登录模块必须单独引用，不然出现ERROR [ExceptionsHandler] Unknown authentication strategy "local" Error: Unknown authentication stra
})
export class AdminModule{}