import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity } from 'src/entities/shop/category.entity';
import { CategoryController } from './controller/category.controller';
import { CategoryService } from './service/category.service';
@Module({
  imports: [
    RouterModule.register([{ path: '', module: GoodsModule }]),
    TypeOrmModule.forFeature([
        CategoryEntity,
    ]),
  ],
  controllers: [
    CategoryController, 
  ],
  providers: [
    CategoryService,
  ],
})
export class GoodsModule {}