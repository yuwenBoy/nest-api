import { Module } from '@nestjs/common';
import { HomeController } from "./controller/home.controller";
import { HomeService } from "./service/home.service";
import { RouterModule } from "@nestjs/core";
import { StoreEntity } from 'src/entities/store/store.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
@Module({
  imports: [
    RouterModule.register([{ path: 'client', module: HomeModule }]),
    TypeOrmModule.forFeature([StoreEntity]),
  ],
  controllers: [HomeController],
  providers: [HomeService],
  exports: [HomeService],
})
export class HomeModule {}