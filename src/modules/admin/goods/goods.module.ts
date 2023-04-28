import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity } from 'src/entities/shop/category.entity';
import { CategoryController } from './controller/category.controller';
import { CategoryService } from './service/category.service';
import { AuthModule } from '../system/auth/auth.module';

/**
 * 商品管理模块
 */
@Module({
  imports: [
    AuthModule,
    RouterModule.register([{ path: '', module: GoodsModule, }]),
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
