import { Module } from "@nestjs/common";
import { AuthModule } from "./system/auth/auth.module";
import { SystemModule } from "./system/system.module";

@Module({
    imports:[SystemModule,AuthModule]
})
export class AdminModule{}