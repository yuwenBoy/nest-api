import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../user/auth/auth.module';
import { ProductEntity } from 'src/entities/product/product.entity';
import { GoodsController } from './controller/goods.controller';
import { GoodsService } from './service/goods.service';
@Module({
  imports: [
    AuthModule,
    RouterModule.register([{ path: 'client', module: GoodsModule }]),
    TypeOrmModule.forFeature([
        ProductEntity,
    ]),
  ],
  controllers: [
    GoodsController, 
  ],
  providers: [
    GoodsService,
  ],
  exports:[GoodsService],
})
export class GoodsModule {}
