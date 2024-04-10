import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity } from 'src/entities/shop/category.entity';
import { CategoryController } from './controller/category.controller';
import { CategoryService } from './service/category.service';
import { AuthModule } from '../system/auth/auth.module';
import { SpuController } from './controller/spu.controller';
import { SpuService } from './service/spu.service';
import { GoodsEntity } from 'src/entities/shop/goods.entity';

/**
 * 商品管理模块
 */
@Module({
  imports: [
    AuthModule,
    RouterModule.register([{ path: '', module: GoodsModule, }]),
    TypeOrmModule.forFeature([
        CategoryEntity,
        GoodsEntity,
    ]),
  ],
  controllers: [
    CategoryController, 
    SpuController,
  ],
  providers: [
    CategoryService,
    SpuService,
  ],
})
export class GoodsModule {}
