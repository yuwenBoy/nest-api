import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../user/auth/auth.module';
import { ProductEntity } from 'src/entities/product/product.entity';
import { ProductDynamicAttributeEntity } from 'src/entities/product/product_dynamic_attribute.entity';
import { DynamicAttributeEntity } from 'src/entities/admin/dynamic_attribute.entity';
import { DynamicAttributeValueEntity } from 'src/entities/admin/dynamic_attribute_value.entity';
import { productCategoryDynamicAttributeRelationEntity } from 'src/entities/admin/product_category_dynamic_attribute_relation.entity';
import { ProductSpecEntity } from 'src/entities/product/product_spec.entity';
import { ProductSpecAttrRelationEntity } from 'src/entities/product/product_spec_attr_relation.entity';
import { GoodsController } from './controller/goods.controller';
import { GoodsService } from './service/goods.service';
@Module({
  imports: [
    AuthModule,
    RouterModule.register([{ path: 'client', module: GoodsModule }]),
    TypeOrmModule.forFeature([
        ProductEntity,
        ProductDynamicAttributeEntity,
        DynamicAttributeEntity,
        DynamicAttributeValueEntity,
        productCategoryDynamicAttributeRelationEntity,
        ProductSpecEntity,
        ProductSpecAttrRelationEntity,
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
