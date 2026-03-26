import { Module } from '@nestjs/common';
import { HomeController } from "./controller/home.controller";
import { HomeService } from "./service/home.service";
import { RouterModule } from "@nestjs/core";
import { StoreEntity } from 'src/entities/store/store.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductGroupEntity } from 'src/entities/product/product_group.entity';
import { ProductGroupRelationEntity } from 'src/entities/product/product_group_relation.entity';
import { ProductEntity } from 'src/entities/product/product.entity';
import { ProductSpecEntity } from 'src/entities/product/product_spec.entity';
import { OrderEntity } from 'src/entities/business/order.entity';
import { OrderItemEntity } from 'src/entities/business/order_item.entity';
import { ProductSpecAttrRelationEntity } from 'src/entities/product/product_spec_attr_relation.entity';
@Module({
  imports: [
    RouterModule.register([{ path: 'client', module: HomeModule }]),
    TypeOrmModule.forFeature([StoreEntity,ProductGroupEntity,ProductGroupRelationEntity,ProductEntity,
        ProductSpecEntity,ProductSpecAttrRelationEntity,OrderEntity,OrderItemEntity]),
  ],
  controllers: [HomeController],
  providers: [HomeService],
  exports: [HomeService],
})
export class HomeModule {}