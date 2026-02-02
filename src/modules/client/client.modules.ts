import { Module } from "@nestjs/common";
import { UserModule } from "./user/user.module";
import { HomeModule } from "./home/home.module";
@Module({
    imports:[
        UserModule, // 客户端用户模块
        HomeModule, // 客户端首页模块
    ]
})
export class ClientModule{}