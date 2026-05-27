import { Module } from '@nestjs/common';
import { HomeController } from "./controller/home.controller";
import { IpLocationController } from "./controller/ip-location.controller";
import { HomeService } from "./service/home.service";
import { RouterModule } from "@nestjs/core";
import { StoreEntity } from '../../../entities/store/store.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductGroupEntity } from '../../../entities/product/product_group.entity';
import { ProductGroupRelationEntity } from '../../../entities/product/product_group_relation.entity';
import { ProductEntity } from '../../../entities/product/product.entity';
import { ProductSpecEntity } from '../../../entities/product/product_spec.entity';
import { OrderEntity } from '../../../entities/business/order.entity';
import { OrderItemEntity } from '../../../entities/business/order_item.entity';
import { ProductSpecAttrRelationEntity } from '../../../entities/product/product_spec_attr_relation.entity';
@Module({
  imports: [
    RouterModule.register([{ path: 'client', module: HomeModule }]),
    TypeOrmModule.forFeature([StoreEntity,ProductGroupEntity,ProductGroupRelationEntity,ProductEntity,
        ProductSpecEntity,ProductSpecAttrRelationEntity,OrderEntity,OrderItemEntity]),
  ],
  controllers: [HomeController, IpLocationController],
  providers: [HomeService],
  exports: [HomeService],
})
export class HomeModule {}