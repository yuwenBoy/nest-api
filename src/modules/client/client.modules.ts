import { Module } from "@nestjs/common";
import { UserModule } from "./user/user.module";
import { HomeModule } from "./home/home.module";
import { OrderModule } from "./order/order.module";
import { PayModule } from "./pay/pay.module";
import { GoodsModule } from "./goods/goods.module";
@Module({
    imports:[
        UserModule, // 客户端用户模块
        HomeModule, // 客户端首页模块
        GoodsModule, // 客户端商品模块
        OrderModule, // 客户端订单模块
        PayModule, // 客户端支付模块
    ]
})
export class ClientModule{}