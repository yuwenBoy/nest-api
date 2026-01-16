import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../system/auth/auth.module';
import { EmployeeEntity } from 'src/entities/store/employee.entity';
import { ProductGroupEntity } from 'src/entities/product/product_group.entity';
import { ProductGroupController } from './controller/product_group.controller';
import { ProductGroupService } from './service/product_group.service';
import { ProductCategoryController } from './controller/productCategory.controller';
import { ProductCategoryService } from './service/productCategory.service';
import { ProductCategoryEntity } from 'src/entities/product/product_category.entity';
import { productCategoryDynamicAttributeRelationEntity } from 'src/entities/admin/product_category_dynamic_attribute_relation.entity';
import { ProductEntity } from 'src/entities/product/product.entity';
import { ProductController } from './controller/product.controller';
import { ProductService } from './service/product.service';
import { ProductGroupRelationEntity } from 'src/entities/product/product_group_relation.entity';
import { ProductCategoryRelationEntity } from 'src/entities/product/product_category_relation.entity';
import { ProductSpecEntity } from 'src/entities/product/product_spec.entity';
import { ProductDynamicAttributeEntity } from 'src/entities/product/product_dynamic_attribute.entity';
import { ProductSpecAttrEntity } from 'src/entities/product/product_spec_attr.entity';
import { ProductSpecAttrOptionEntity } from 'src/entities/product/product_spec_attrOption.entity';
import { ProductSpecAttrRelationEntity } from 'src/entities/product/product_spec_attr_relation.entity';
import { DynamicAttributeValueEntity } from 'src/entities/admin/dynamic_attribute_value.entity';
import { StoreEntity } from 'src/entities/store/store.entity';

/**
 * 产品模块表
 */
@Module({
  imports: [
    AuthModule,
    RouterModule.register([{ path: '', module: ProductModule, }]),
    TypeOrmModule.forFeature([
        ProductEntity,
        ProductSpecEntity,
        ProductSpecAttrEntity,
        ProductSpecAttrOptionEntity,
        ProductSpecAttrRelationEntity,
        ProductGroupEntity,
        EmployeeEntity,
        StoreEntity,
        ProductCategoryEntity,
        ProductCategoryRelationEntity,
        ProductGroupRelationEntity,
        productCategoryDynamicAttributeRelationEntity,
        ProductDynamicAttributeEntity,
        DynamicAttributeValueEntity,
    ]),
  ],
  controllers: [
    ProductController,
    ProductGroupController, 
    ProductCategoryController,
  ],  
  providers: [
    ProductService,
    ProductGroupService,
    ProductCategoryService,
  ],
})
export class ProductModule {}
