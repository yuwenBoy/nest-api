import { Module } from "@nestjs/common";
import { UserModule } from "./user/user.module";
@Module({
    imports:[
        UserModule, // 客户端用户模块
    ]
})
export class ClientModule{}