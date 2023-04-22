import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity } from 'src/entities/shop/category.entity';
import { CategoryService } from './service/category.service';
import { CategoryController } from './controller/category.controller';
@Module({
  imports: [
    RouterModule.register([{ path: '', module: GoodsModule }]),
    TypeOrmModule.forFeature([
     CategoryEntity
    ]),
  ],
  controllers: [
    CategoryController, // 登录jwt鉴权控制器
  ],
  providers: [
    CategoryService,
  ],
})
export class GoodsModule {}
